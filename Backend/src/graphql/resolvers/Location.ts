import { useDataService } from "../../shared/rds/useDataService";
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

export const LocationResolver = {
    NearbyMember: {
        member: (root: any, _args: {}, context: IApolloContext) => {
            return context.dataSources.members.readOne(root.member);
        },

        state: (root: any, _args: {}, _context: IApolloContext) => {
            return !root.speed || root.speed < 8 ? "Steady": "Traveling";
        },
    },

    Query: {
        nearbyMembers: async (_root: any, args: NearMembersInput, context: IApolloContext) => {
            context.logger.log("nearby", args);
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
    and ST_DWithin(locations.point, $1::geography, ${process.env.NEARBY_RADIUS || 100000})
    and association = $3
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

                    return result.rows.length > 0 ? result.rows : null;
                }
            );
        }
    },

    Mutation: {
        putLocation: async (_root: any, args: MyLocationInput, context: IApolloContext) => {
            context.logger.log("putLocation", args);

            return useDataService(
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
                            args.location.speed,
                            args.location.address ? JSON.stringify(args.location.address) : null
                        ]);
                    return true;
                }
            )
        },

        disableLocationServices: async (_root: any, _args: {}, context: IApolloContext) => {
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
            )
        },

    }
};