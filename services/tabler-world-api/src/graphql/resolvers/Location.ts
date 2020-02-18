import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { BigDataResult, convertToCityLocation } from '@mskg/tabler-world-geo-bigdata';
import { useDataService } from '@mskg/tabler-world-rds-client';
import { getNearByParams } from '../helper/getNearByParams';
import { IApolloContext } from '../types/IApolloContext';

type MyLocationInput = {
    location: {
        longitude: number,
        latitude: number,
        accuracy: number,
        speed: number,
        address?: any,
    },
};

type NearMembersInput = {
    location: {
        longitude: number,
        latitude: number,
    },

    query?: {
        excludeOwnTable?: boolean,
    },
};

type UpdateLocationAddress = {
    corrections: {
        member: number,
        address: any,
    }[],
};

// tslint:disable: export-name
// tslint:disable: variable-name
export const LocationResolver = {

    Member: {
        sharesLocation: (root: any, _args: {}, context: IApolloContext) => {
            return context.dataSources.location.isMemberSharingLocation(root.id);
        },
    },

    NearbyMember: {
        member: (root: any, _args: {}, context: IApolloContext) => {
            return context.dataSources.members.readOne(root.member);
        },

        state: (root: any, _args: {}, _context: IApolloContext) => {
            return !root.speed || root.speed < 8 ? 'Steady' : 'Traveling';
        },

        location: (root: any, _args: {}, _context: IApolloContext) => {
            return root.canshowonmap ? {
                longitude: root.longitude,
                latitude: root.latitude,
            } : null;
        },

        locationName: async (root: any, _args: {}, _context: IApolloContext) => {
            // old data, leave like it is
            if (root.address.city || root.address.region) {
                return {
                    name: root.address.city || root.address.region,
                    country: root.address.country,
                };
            }

            const bigData: BigDataResult = root.address;
            const nearBy = await getNearByParams();

            return convertToCityLocation(bigData, nearBy.administrativePreferences);
        },

        // TODO: deprecated
        address: ({ address, canshowonmap, longitude, latitude }: any, _args: {}, _context: IApolloContext) => {
            // old data, leave like it is
            if (address.city || address.region) {
                return {
                    // backward compatibility
                    location: canshowonmap
                        ? {
                            longitude,
                            latitude,
                        } : null,

                    city: address.city,
                    region: address.region,
                    country: address.isoCountryCode || address.country,
                };
            }

            return {
                postal_code: address.postcode,
                city: address.locality || address.principalSubdivision || address.countryName || address.continent,
                country: address.countryCode || address.continent || address.countryName,

                // backward compatibility
                location: canshowonmap
                    ? {
                        longitude,
                        latitude,
                    } : null,
            };
        },
    },

    Query: {
        nearbyMembers: async (_root: any, args: NearMembersInput, context: IApolloContext) => {
            context.logger.log('nearby', args);

            const userShares = context.dataSources.location.isMemberSharingLocation(context.principal.id);
            const nearByQuery = getNearByParams();

            return await userShares
                ? useDataService(
                    context,
                    async (client) => {
                        const nearBy = await nearByQuery;
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
    and ST_DWithin(locations.point, $1::geography, ${nearBy.radius})
    ${EXECUTING_OFFLINE ? '' : `and lastseen > (now() - '${nearBy.days} day'::interval)`}
    ${args.query && args.query.excludeOwnTable ? 'and club <> $3' : ''}

    and address is not null
ORDER BY
    locations.point <-> $1::geography
LIMIT 20
`,
                            [
                                `POINT(${args.location.longitude} ${args.location.latitude})`,
                                context.principal.id,
                                args.query && args.query.excludeOwnTable ? context.principal.club : undefined,
                            ].filter(Boolean));

                        return result.rows.length > 0 ? result.rows : [];
                    },
                )
                : [];
        },

        LocationHistory: async (_root: any, args: {}, context: IApolloContext) => {
            context.logger.log('locationHistory', args);

            return useDataService(
                context,
                async (client) => {
                    const result = await client.query(
                        `
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
                },
            );
        },
    },

    Mutation: {
        putLocation: (_root: any, args: MyLocationInput, context: IApolloContext) => {
            context.logger.log('putLocation', args);

            useDataService(
                context,
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
                            context.principal.id,
                            `POINT(${args.location.longitude} ${args.location.latitude})`,
                            args.location.accuracy,
                            Math.round(args.location.speed),
                            args.location.address ? JSON.stringify(args.location.address) : null,
                        ],
                    );
                    return true;
                },
            );
        },

        updateLocationAddress: (_root: any, _args: UpdateLocationAddress, _context: IApolloContext) => {
            // deprecated
            return;

            //             context.logger.log('updateLocationAddress', args);

            //             return useDataService(
            //                 context,
            //                 async (client) => {
            //                     for (const update of args.corrections) {
            //                         await client.query(
            //                             `
            // UPDATE userlocations
            // SET address = $2
            // WHERE id = $1 and address is null
            // `,
            //                             [
            //                                 update.member,
            //                                 JSON.stringify(update.address),
            //                             ],
            //                         );
            //                     }

            //                     return true;
            //                 },
            //             );
        },

        disableLocationServices: (_root: any, _args: {}, context: IApolloContext) => {
            return useDataService(
                context,
                async (client) => {
                    await client.query(
                        `
delete from userlocations
WHERE id = $1
                        `,
                        [context.principal.id],
                    );

                    return true;
                },
            );
        },

    },
};
