import { StopWatch } from '@mskg/tabler-world-common';
import { DataSourceConfig } from 'apollo-datasource';
import { chunk, filter, keys, take, values } from 'lodash';
import { Environment } from '../Environment';
import { createRedisInstance } from '../helper/createRedisInstance';
import { RedisStorage } from '../helper/RedisStorage';
import { IApolloContext } from '../types/IApolloContext';
import { ILocationStorage, Location, PutLocation, QueryResult } from './ILocationStorage';

export class RedisLocationStorage implements ILocationStorage {
    private client!: RedisStorage;
    private context!: IApolloContext;

    public initialize(config: DataSourceConfig<IApolloContext>) {
        this.client = createRedisInstance();
        this.context = config.context;
    }

    public locationOf(member: number): Promise<Location | undefined> {
        return this.client.geopos(`${Environment.stageName}:nearby:geo`, member.toString());
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

            // search by geolocation in radius, store in temp_search
            multi.georadiusbymember(
                `${Environment.stageName}:nearby:geo`,
                memberToMatch.toString(),
                radius,
                `${Environment.stageName}:nearby:temp_search`,
            );

            // intersect search with ttl -> temp_ttl
            multi.zinterstore(
                `${Environment.stageName}:nearby:temp_ttl`,

                `${Environment.stageName}:nearby:temp_search`,
                `${Environment.stageName}:nearby:ttl`,
                0,
                1,
            );

            if (age) {
                // remove all older than x days
                multi.zremrangebyscore(
                    `${Environment.stageName}:nearby:temp_ttl`,
                    '-inf',
                    Date.now() - age * 1000 * 60 * 60 * 24,
                );
            }

            // get radius for not oldest members
            multi.zinterstore(
                `${Environment.stageName}:nearby:temp_radius`,
                `${Environment.stageName}:nearby:temp_search`,
                `${Environment.stageName}:nearby:temp_ttl`,
                1,
                0,
            );

            // get nearest 20 elements
            multi.zrange(
                `${Environment.stageName}:nearby:temp_radius`,
                0,

                // we query double the size to be able to exclude those without
                // and address
                count * 2,
            );

            let raw = await multi.exec();

            // we have to slize by 4 commands
            raw = raw.slice(multi.numerOfCommands - 1);
            const memberWithDistance: any = {};

            chunk(raw[0] as string[], 2).forEach((c: string[]) => {
                // [0] is key
                const member = parseInt(c[0], 10);
                // [1] is score = distance
                const distance = parseFloat(c[1]);

                memberWithDistance[`${Environment.stageName}:nearby:${c[0]}`] = {
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

            const result = await this.client.mget(ids);
            keys(result).forEach((k) => {
                const md = memberWithDistance[k];
                const r = result[k];

                result[k] = {
                    ...r,
                    lastseen: new Date(r.lastseen),
                    accuracy: Math.round(r.accuracy),
                    distance: Math.round(md.distance),
                    member: md.member,
                };
            });

            return take(
                filter(
                    values(result),
                    (m) => m.member !== memberToMatch,
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
            `${Environment.stageName}:nearby:geo`,
            longitude,
            latitude,
            member.toString(),
        );

        // details of last location
        multi.set(
            `${Environment.stageName}:nearby:${member}`,
            {
                speed,
                address,
                accuracy,
                lastseen: lastseen.valueOf(),
                position: { longitude, latitude },
            },
        );

        // newest members first
        multi.zadd(
            `${Environment.stageName}:nearby:ttl`,
            lastseen.valueOf(),
            member.toString(),
        );

        await multi.exec();
    }
}
