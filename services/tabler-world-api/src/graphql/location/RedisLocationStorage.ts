import { IORedisClient } from '@mskg/tabler-world-cache';
import { StopWatch } from '@mskg/tabler-world-common';
import { DataSourceConfig } from 'apollo-datasource';
import { chunk, filter, keys, take, values } from 'lodash';
import { createIORedisClient } from '../helper/createIORedisClient';
import { IApolloContext } from '../types/IApolloContext';
import { ILocationStorage, Location, PutLocation, QueryResult } from './ILocationStorage';

export class RedisLocationStorage implements ILocationStorage {
    private client!: IORedisClient;
    private context!: IApolloContext;

    public initialize(config: DataSourceConfig<IApolloContext>) {
        this.client = createIORedisClient();
        this.context = config.context;
    }

    public async locationOf(member: number): Promise<Location | undefined> {
        const result = await this.client.geopos('nearby:geo', [member.toString()]);
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
    public async query(memberToMatch: number, radius: number, count: number, age?: number): Promise<QueryResult> {
        const sw = new StopWatch();
        try {
            const multi = await this.client.multi();

            // we need to neglect connection setup
            sw.start();

            // search by geolocation in radius, store in temp_radius
            multi.georadiusbymemberStoreDistance(
                'nearby:geo',
                memberToMatch.toString(),
                radius * 1000,
                'm',
                'nearby:temp_radius',
            );

            // intersect search with ttl -> temp_ttl
            multi.zinterstore(
                'nearby:temp_ttl',
                'nearby:temp_radius',
                'nearby:ttl',
                0,
                1,
            );

            if (age) {
                // remove all older than x days
                multi.zremrangebyscore(
                    'nearby:temp_ttl',
                    '-inf',
                    Date.now() - age * 1000 * 60 * 60 * 24,
                );
            }

            // get radius for not oldest members
            multi.zinterstore(
                'nearby:result_radius',
                'nearby:temp_radius',
                'nearby:temp_ttl',
                1,
                0,
            );

            // get nearest 20 elements
            multi.zrange(
                'nearby:result_radius',
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

                memberWithDistance[`nearby:${c[0]}`] = {
                    member,
                    distance,
                };
            });

            const ids = keys(memberWithDistance);
            this.context.logger.log('ids', ids);

            // should never happen as we are always there
            if (ids.length === 0) {
                return [];
            }

            // We take the location from the mget, not the georadius.
            // Such, there can/will be a drift in the position, but only the distance will be wrong.
            const result = await this.client.mget(ids);

            // can show on map?
            const mapEnabled = await this.context.dataSources.location.isMembersVisibleOnMap(
                ids.map((i) => parseInt(i, 10)));

            keys(result).forEach((k, i) => {
                const md = memberWithDistance[k];
                const r = result[k];

                result[k] = {
                    ...r,
                    location: r.location || r.position, // compat
                    lastseen: new Date(r.lastseen),
                    accuracy: Math.round(r.accuracy),
                    distance: Math.round(md.distance),
                    member: md.member,
                    canshowonmap: mapEnabled[i],
                };
            });

            return take(
                filter(
                    values(result),
                    (m) => m.member !== memberToMatch && m.address,
                ),
                count,
            );
        } finally {
            this.context.logger.log('[RedisLocationStorage]', 'took', sw.elapsedYs, 'ys');
        }
    }

    public async putLocation(
        { longitude, latitude, member, lastseen, speed, address, accuracy }: PutLocation,
    ) {
        // const params = getNearByParams();
        const multi = await this.client.multi();

        // point
        multi.geoadd(
            'nearby:geo',
            longitude,
            latitude,
            member.toString(),
        );

        // details of last location
        multi.set(
            `nearby:${member}`,
            {
                speed,
                address,
                accuracy,
                lastseen: lastseen.valueOf(),
                location: { longitude, latitude },
            },
        );

        // newest members first
        multi.zadd(
            'nearby:ttl',
            lastseen.valueOf(),
            member.toString(),
        );

        await multi.exec();
    }
}
