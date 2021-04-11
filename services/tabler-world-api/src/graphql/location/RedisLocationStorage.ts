import { IORedisClient } from '@mskg/tabler-world-cache';
import { StopWatch } from '@mskg/tabler-world-common';
import { DataSourceConfig } from 'apollo-datasource';
import { chunk, keys, slice, take, values } from 'lodash';
import { createIORedisClient } from '../helper/createIORedisClient';
import { Metrics } from '../logging/Metrics';
import { IApolloContext } from '../types/IApolloContext';
import { ILocationStorage, Location, PutLocation, QueryResult, QueryResultRecord } from './ILocationStorage';

type WorkArray = (QueryResultRecord & { club: string, association: string, family: string })[];

const REDIS_KEY_POSITION = 'nearby:geo';
const REDIS_KEY_MEMBER = (m: number | string) => `nearby:${m}`;
const REDIS_KEY_TTL = 'nearby:ttl';

const REDIS_TEMP_RADIUS = 'nearby:temp_radius';
const REDIS_TEMP_TTL = 'nearby:temp_ttl';
const REDIS_RESULT_RADIUS = 'nearby:result_radius';

export class RedisLocationStorage implements ILocationStorage {
    private client!: IORedisClient;
    private context!: IApolloContext;

    public initialize(config: DataSourceConfig<IApolloContext>) {
        this.client = createIORedisClient();
        this.context = config.context;
    }

    // we make one store per family
    makeLocationKey() {
        return `${REDIS_KEY_POSITION}:${this.context.principal.family}`;
    }

    public async locationOf(member: number): Promise<Location | undefined> {
        const result = await this.client.geopos(this.makeLocationKey(), [member.toString()]);
        if (result.length === 1) {
            return result[0];
        }

        return undefined;
    }

    /*
    multi
    georadiusbymember "dev:nearby:geo" "14225" "100000" "km" "STOREDIST" "dev:nearby:temp_search"
    zinterstore "dev:nearby:temp_ttl" "2" "dev:nearby:temp_search" "dev:nearby:ttl" "WEIGHTS" "0" "1"
    zinterstore "dev:nearby:temp_radius" "2" "dev:nearby:temp_search" "dev:nearby:temp_ttl" "WEIGHTS" "1" "0"
    zrange "dev:nearby:temp_radius" "0" "21" "WITHSCORES"
    exec
    */
    // tslint:disable-next-line: max-func-body-length
    public async query(memberToMatch: number, radius: number, count: number, excludeOwnTable: boolean, age?: number): Promise<QueryResult> {
        const sw = new StopWatch();
        try {
            const multi = await this.client.multi();

            // we need to neglect connection setup
            sw.start();

            // search by geolocation in radius, store in temp_radius
            multi.georadiusbymemberStoreDistance(
                this.makeLocationKey(),
                memberToMatch.toString(),
                radius * 1000,
                'm',
                REDIS_TEMP_RADIUS,
            );

            // intersect search with ttl -> temp_ttl
            multi.zinterstore(
                REDIS_TEMP_TTL,
                REDIS_TEMP_RADIUS,
                REDIS_KEY_TTL,
                0,
                1,
            );

            if (age) {
                // remove all older than x days
                multi.zremrangebyscore(
                    REDIS_TEMP_TTL,
                    '-inf',
                    Date.now() - age * 1000 * 60 * 60 * 24,
                );
            }

            // get radius for not oldest members
            multi.zinterstore(
                REDIS_RESULT_RADIUS,
                REDIS_TEMP_RADIUS,
                REDIS_TEMP_TTL,
                1,
                0,
            );

            // get nearest 20 elements
            multi.zrange(
                REDIS_RESULT_RADIUS,
                0,

                // we query double the size to be able to exclude those without
                // a lost update and a valid address
                count * 3,
            );

            let raw = await multi.exec();

            // we have to slize by 4 commands
            raw = raw.slice(multi.numerOfCommands - 1);

            const memberWithDistance: any = {};
            chunk(raw[0][1] as string[], 2).forEach((c: string[]) => {
                // [0] is key
                const member = parseInt(c[0], 10);
                // [1] is score = distance
                const distance = parseFloat(c[1]);

                memberWithDistance[REDIS_KEY_MEMBER(c[0])] = {
                    member,
                    distance,
                };
            });

            const ids = keys(memberWithDistance);
            this.context.logger.debug('ids', ids);

            // should never happen as we are always there
            if (ids.length === 0) {
                return [];
            }

            // We take the location from the mget, not the georadius.
            // Such, there can/will be a drift in the position, but only the distance will be wrong.
            const locations = await this.client.mget(ids);

            // we sort them by
            const allResult: WorkArray = [];

            // we must preserve order
            ids.forEach((k) => {
                const md = memberWithDistance[k];
                const r = locations[k];

                if (!r.address) {
                    // we don't have an address
                    return;
                }

                if (md.member === this.context.principal.id) {
                    // we exclue ourself
                    return;
                }

                // tslint:disable-next-line: triple-equals
                if (excludeOwnTable && r.club == this.context.principal.club) {
                    // we must exclude our own table
                    return;
                }

                allResult.push({
                    ...r,
                    location: r.location || r.position, // compat
                    lastseen: new Date(r.lastseen),
                    accuracy: Math.round(r.accuracy),
                    distance: Math.round(md.distance),
                    member: md.member,
                    // canshowonmap: mapEnabled[i],
                });
            });

            let countResults: WorkArray = [];
            let remaining = allResult;
            while (remaining.length > 0) {
                // we fetch only the required amount * 2
                const nextSequenceAmount = Math.abs(
                    Math.min(count, (count - countResults.length) * 2),
                );

                this.context.logger.debug(
                    'Update results',
                    'total', allResult.length,
                    'taken', countResults.length,
                    'remaining', remaining.length,
                    'next amount', nextSequenceAmount,
                );

                const testSequence = take(remaining, nextSequenceAmount);
                remaining = slice(remaining, nextSequenceAmount);

                countResults.push(... await this.filterSequence(testSequence));
                if (countResults.length >= count) {
                    countResults = take(countResults, count);
                    break;
                }
            }

            if (countResults.length === 0) {
                return [];
            }

            // add mapEnabled flag for the rest of the records
            const mapEnabled = await this.context.dataSources.location.isMembersVisibleOnMap(
                values(countResults).map((i: any) => parseInt(i.member, 10)));

            countResults.forEach((e, i) => {
                e.canshowonmap = mapEnabled[i];
            });

            return countResults as QueryResult;
        } finally {
            this.context.metrics.add({ id: Metrics.QueryLocation, value: sw.elapsedYs, unit: 'μs' });
        }
    }

    async filterSequence(filteredResult: WorkArray) {
        // most likely they will be loaded anyhow, this doesn't hurt much
        // in case of missing entries, we cannot prevent the round trip to the database
        const members = await this.context.dataSources.members.readMany(
            values(filteredResult).map((i: any) => parseInt(i.member, 10)));

        const finalResult: (QueryResultRecord & { club: string, association: string, family: string })[] = [];
        const removals: number[] = [];
        members.forEach((m, i) => {
            // member is no longer active
            if (!m) {
                removals.push(filteredResult[i].member);
            } else {
                finalResult.push(filteredResult[i]);
            }
        });

        // cleanup stale data
        if (removals.length > 0) {
            this.context.logger.log('Cleaning up', removals);
            const cleanup = await this.client.multi();

            cleanup.hdel(this.makeLocationKey(), removals.map((r) => r.toString()));
            cleanup.del(...removals.map((r) => REDIS_KEY_MEMBER(r)));
            cleanup.zrem(REDIS_KEY_TTL, ...removals.map((r) => r.toString()));

            await cleanup.exec();
        }

        return finalResult;
    }

    public async putLocation(
        {
            longitude, latitude,
            member, club, association, family,
            lastseen,
            speed, accuracy,
            address,
        }: PutLocation,
    ) {
        // const params = getNearByParams();
        const multi = await this.client.multi();

        // point
        multi.geoadd(
            this.makeLocationKey(),
            longitude,
            latitude,
            member.toString(),
        );

        // details of last location
        multi.set(
            REDIS_KEY_MEMBER(member),
            {
                speed,
                address,
                accuracy,
                club, association, family,
                lastseen: lastseen.valueOf(),
                location: { longitude, latitude },
            },
        );

        // newest members first
        multi.zadd(
            REDIS_KEY_TTL,
            lastseen.valueOf(),
            member.toString(),
        );

        await multi.exec();
    }
}
