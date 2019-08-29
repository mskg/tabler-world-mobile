import { EXECUTING_OFFLINE } from "@mskg/tabler-world-aws";
import { getParameters, Param_Nearby } from "@mskg/tabler-world-config";
import { useDataService } from "@mskg/tabler-world-rds-client";
import { IApolloContext } from "../types/IApolloContext";

type MyLocationInput = {
    location: {
        longitude: number,
        latitude: number,
        accuracy: number,
        speed: number,
        address?: any,
    }
}

type NearMembersInput = {
    location: {
        longitude: number,
        latitude: number,
    },

    query?: {
        excludeOwnTable?: boolean,
    }
}

type UpdateLocationAddress = {
    corrections: {
        member: number,
        address: any,
    }[],
}

export const LocationResolver = {
    NearbyMember: {
        member: (root: any, _args: {}, context: IApolloContext) => {
            return context.dataSources.members.readOne(root.member);
        },

        state: (root: any, _args: {}, _context: IApolloContext) => {
            return !root.speed || root.speed < 8 ? "Steady" : "Traveling";
        },
    },

    Query: {
        nearbyMembers: async (_root: any, args: NearMembersInput, context: IApolloContext) => {
            context.logger.log("nearby", args);

            const params = await getParameters("nearby");
            const nearBy = JSON.parse(params.nearby) as Param_Nearby;

            return useDataService(
                context,
                async (client) => {
                    const result = await client.query(`
SELECT
    member,
    address,
    lastseen,
    speed,
    CAST(ST_Distance(
        locations.point,
        $1::geography
    ) as integer) AS distance
FROM
    userlocations_match locations
WHERE
        member <> $2

    and exists (
        select 1
        from usersettings u
        where
                u.id = $2
            and (u.settings->>'nearbymembers')::boolean = TRUE
    )

    and ST_DWithin(locations.point, $1::geography, ${nearBy.radius})
    and association = $3
    ${EXECUTING_OFFLINE ? "" : `and lastseen > (now() - '${nearBy.days} day'::interval)`}
    ${args.query && args.query.excludeOwnTable ? "and club <> $4" : ""}
ORDER BY
    locations.point <-> $1::geography
LIMIT 20
`,
                        [
                            `POINT(${args.location.longitude} ${args.location.latitude})`,
                            context.principal.id,
                            context.principal.association,
                            args.query && args.query.excludeOwnTable ? context.principal.club : undefined
                        ].filter(Boolean));

                    return result.rows.length > 0 ? result.rows : [];
                }
            );
        },

        LocationHistory: async (_root: any, args: {}, context: IApolloContext) => {
            context.logger.log("locationHistory", args);

            return useDataService(
                context,
                async (client) => {
                    const result = await client.query(`
select
    lastseen,
    address->>'city' as city,
    address->>'street' as street,
    coalesce(address->>'country', address->>'countryISOCode') as country,
    accuracy,
    ST_X(point::geometry) as longitude,
    ST_Y(point::geometry) as latitude
from
    userlocations_history
where
    id = $1
order by lastseen desc
LIMIT 10
`,
                        [
                            context.principal.id,
                        ]);

                    return result.rows.length > 0 ? result.rows : [];
                }
            );
        },
    },

    Mutation: {
        putLocation: (_root: any, args: MyLocationInput, context: IApolloContext) => {
            context.logger.log("putLocation", args);

            useDataService(
                context,
                async (client) => {
                    await client.query(`
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
                            context.principal.id,
                            `POINT(${args.location.longitude} ${args.location.latitude})`,
                            args.location.accuracy,
                            Math.round(args.location.speed),
                            args.location.address ? JSON.stringify(args.location.address) : null
                        ]);
                    return true;
                }
            );
        },

        updateLocationAddress: (_root: any, args: UpdateLocationAddress, context: IApolloContext) => {
            context.logger.log("updateLocationAddress", args);

            return useDataService(
                context,
                async (client) => {
                    for (let update of args.corrections) {
                        await client.query(`
UPDATE userlocations
SET address = $2
WHERE id = $1 and address is null
`,
                            [
                                update.member,
                                JSON.stringify(update.address)
                            ]);
                    }

                    return true;
                }
            );
        },

        disableLocationServices: (_root: any, _args: {}, context: IApolloContext) => {
            return useDataService(
                context,
                async (client) => {
                    await client.query(`
delete from userlocations
WHERE id = $1
                        `,
                        [context.principal.id]);

                    return true;
                }
            );
        },

    }
};
