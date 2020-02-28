import { StopWatch } from '@mskg/tabler-world-common';
import { useDatabase } from '@mskg/tabler-world-rds-client';
import { DataSourceConfig } from 'apollo-datasource';
import { IApolloContext } from '../types/IApolloContext';
import { ILocationStorage, Location, PutLocation, QueryResult } from './ILocationStorage';
import { Metrics } from '../logging/Metrics';

// tslint:disable-next-line: export-name
export class SqlLocationStorage implements ILocationStorage {
    private context!: IApolloContext;

    public initialize(config: DataSourceConfig<IApolloContext>) {
        this.context = config.context;
    }

    public locationOf(member: number): Promise<Location | undefined> {
        return useDatabase(
            this.context,
            async (client) => {
                const point = await client.query(
                    `
SELECT
    ST_X (point::geometry) AS longitude,
    ST_Y (point::geometry) AS latitude
FROM
    userlocations_match locations
WHERE
    member = $1
`,
                    [member],
                );

                if (point.rowCount !== 1) {
                    return undefined;
                }

                return point.rows[0];
            },
        );
    }

    public async query(memberToMatch: number, radius: number, count: number, age?: number): Promise<QueryResult> {
        const sw = new StopWatch();
        try {
            return await useDatabase(
                this.context,
                async (client) => {
                    const point = await this.locationOf(memberToMatch);
                    if (!point) {
                        this.context.logger.debug('no point found');
                        return [];
                    }

                    const result = await client.query(
                        `
SELECT
    member,
    address,
    lastseen,
    speed,
    canshowonmap,
    ST_X (point::geometry) AS longitude,
    ST_Y (point::geometry) AS latitude,
    CAST(ST_Distance(
        locations.point,
        $1::geography
    ) as integer) AS distance
FROM
    userlocations_match locations
WHERE
        member <> $2
    and ST_DWithin(locations.point, $1::geography, ${radius})
    ${age ? `and lastseen > (now() - '${age} day'::interval)` : ''}
    ${false /*|| args.query.excludeOwnTable*/ ? 'and club <> $3' : ''}

    and address is not null
ORDER BY
    locations.point <-> $1::geography
LIMIT ${count}
`,
                        [
                            `POINT(${point.longitude} ${point.latitude})`,
                            memberToMatch,
                            // args.query && args.query.excludeOwnTable ? context.principal.club : undefined,
                        ].filter(Boolean));

                    return result.rows.length > 0 ? result.rows : [];
                },
            );
        } finally {
            this.context.metrics.set({ id: Metrics.QueryLocation, value: sw.elapsedYs });
        }
    }

    public async putLocation(
        { longitude, latitude, member, speed, address, accuracy }: PutLocation,
    ) {
        await useDatabase(
            this.context,
            async (client) => {
                await client.query(
                    `
INSERT INTO userlocations(id, point, accuracy, speed, address, lastseen)
VALUES($1, $2, $3, $4, $5, now())
ON CONFLICT (id)
DO UPDATE
SET point = excluded.point,
    accuracy = excluded.accuracy,
    address = excluded.address,
    lastseen = excluded.lastseen,
    speed = excluded.speed
`,
                    [
                        member,
                        `POINT(${longitude} ${latitude})`,
                        accuracy,
                        Math.round(speed),
                        address ? JSON.stringify(address) : null,
                    ],
                );
            },
        );
    }
}
