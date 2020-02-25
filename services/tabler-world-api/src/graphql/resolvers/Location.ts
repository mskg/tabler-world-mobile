import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { defaultParameters } from '@mskg/tabler-world-config-app';
import { BigDataResult, convertToCityLocation, GeoCityLocation } from '@mskg/tabler-world-geo-bigdata';
import { useDatabase } from '@mskg/tabler-world-rds-client';
import Geohash from 'latlon-geohash';
import { values } from 'lodash';
import { getNearByParams } from '../helper/getNearByParams';
import { eventManager, subscriptionManager } from '../subscriptions';
import { pubsub } from '../subscriptions/services/pubsub';
import { WebsocketEvent } from '../subscriptions/types/WebsocketEvent';
import { withFilter } from '../subscriptions/utils/withFilter';
import { IApolloContext } from '../types/IApolloContext';
import { ISubscriptionContext } from '../types/ISubscriptionContext';

type MyLocationInput = {
    location: {
        longitude: number,
        latitude: number,
        accuracy: number,
        speed: number,
        address?: any,
    },
};

type NearMembersQueryInput = {
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

type SubscriptionArgs = {
    id: string;
    type: 'start';
    payload: any;
};

type Payload = {
    member: number,
};

async function convertAddressToLocation(address: any): Promise<GeoCityLocation> {
    // old data, leave like it is
    if (address.city || address.region) {
        return {
            name: address.city || address.region,
            country: address.country,
        };
    }

    const bigData: BigDataResult = address;
    const nearBy = await getNearByParams();

    return convertToCityLocation(
        bigData,
        nearBy.administrativePreferences || defaultParameters.geocoding.bigData,
    );
}

// tslint:disable: export-name
// tslint:disable: variable-name
export const LocationResolver = {

    Member: {
        sharesLocation: (root: any, _args: {}, context: IApolloContext) => {
            return root.sharesLocation ?? context.dataSources.location.isMemberSharingLocation(root.id);
        },
    },

    // TOOD: duplicated code
    LocationHistory: {
        location: (root: any, _args: {}, _context: IApolloContext) => {
            return {
                longitude: root.longitude,
                latitude: root.latitude,
            };
        },

        locationName: (root: any, _args: {}, _context: IApolloContext) => {
            return convertAddressToLocation(root.address);
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

        locationName: (root: any, _args: {}, _context: IApolloContext) => {
            return convertAddressToLocation(root.address);
        },

        // TODO: deprecated
        address: ({ address, canshowonmap, longitude, latitude }: any, _args: {}, _context: IApolloContext) => {
            // old data, leave like it is
            if (address.city || address.region) {
                return {
                    // if we don't this, the address is resolved via geocoder
                    location: canshowonmap
                        ? {
                            longitude,
                            latitude,
                        }
                        : { longitude: 0, latitude: 0 },

                    city: address.city,
                    region: address.region,
                    country: address.isoCountryCode || address.country,
                };
            }

            return {
                postal_code: address.postcode,
                city: address.locality || address.principalSubdivision || address.countryName || address.continent,
                country: address.countryCode || address.continent || address.countryName,

                // if we don't this, the address is resolved via geocoder
                location: canshowonmap
                    ? {
                        longitude,
                        latitude,
                    }
                    : { longitude: 0, latitude: 0 },
            };
        },
    },

    Query: {
        nearbyMembers: async (_root: any, args: NearMembersQueryInput, context: IApolloContext) => {
            context.logger.log('nearby', args);

            const userShares = context.dataSources.location.isMemberSharingLocation(context.principal.id);
            const nearByQuery = getNearByParams();

            return await userShares
                ? useDatabase(
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

            return await useDatabase(
                context,
                async (client) => {
                    const result = await client.query(
                        `
select
    lastseen,
    address,
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
        putLocation: async (_root: any, args: MyLocationInput, context: IApolloContext) => {
            context.logger.log('putLocation', args);

            const db = useDatabase(
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

            // const canShowOnMap = await context.dataSources.location.isMemberVisibleOnMap(context.principal.id);
            const geo = Geohash.encode(args.location.longitude, args.location.latitude, 4);
            const neighBors = values(Geohash.neighbours(geo));

            const names = [geo, ...neighBors].map((hash) => `nearby:${hash}`);
            const publishChannels = await subscriptionManager.hasSubscribers(names);

            let events: Promise<any> = Promise.resolve();
            if (publishChannels.length > 0) {
                events = eventManager.post<Payload>({
                    triggers: publishChannels,
                    payload: {
                        member: context.principal.id,
                    },
                    trackDelivery: false,
                    ttl: 60 * 60, // 1h
                });
            }

            await Promise.all([db, events]);
        },

        // deprecated
        updateLocationAddress: (_root: any, _args: UpdateLocationAddress, _context: IApolloContext) => {
            return;
        },

        disableLocationServices: (_root: any, _args: {}, context: IApolloContext) => {
            return useDatabase(
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

    Subscription: {
        locationUpdate: {
            subscribe: async (root: SubscriptionArgs, args: NearMembersQueryInput, context: ISubscriptionContext, image: any) => {
                const hash = Geohash.encode(args.location.longitude, args.location.latitude, 4);

                // we only subscribe to our circle
                const names = [`nearby:${hash}`];

                if (root) {
                    context.logger.log('subscribe', names);

                    await subscriptionManager.subscribe(
                        context,
                        root.id,
                        names,
                        image.rootValue.payload,
                    );
                }

                // not for me
                return withFilter(
                    () => pubsub.asyncIterator(names),
                    (event: WebsocketEvent<Payload>, _args: any, ctx: ISubscriptionContext): boolean => {
                        return ctx.principal.id !== event.payload.member;
                    },
                )(root, args, context, image);
            },

            // tslint:disable-next-line: variable-name
            resolve: (_channelMessage: WebsocketEvent<GeoCityLocation>, _args: {}, context: ISubscriptionContext, image: any) => {
                context.logger.log('resolve');
                return LocationResolver.Query.nearbyMembers({}, image.variableValues, context);
            },
        },
    },
};
