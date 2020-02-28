import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { defaultParameters } from '@mskg/tabler-world-config-app';
import { BigDataResult, convertToCityLocation, GeoCityLocation } from '@mskg/tabler-world-geo-bigdata';
import { useDatabase } from '@mskg/tabler-world-rds-client';
import Geohash from 'latlon-geohash';
import { values } from 'lodash';
import { getNearByParams } from '../helper/getNearByParams';
import { throw429 } from '../ratelimit/throw429';
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

async function convertAddressToLocation(address: any): Promise<GeoCityLocation | undefined> {
    if (!address) { return undefined; }

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
            return root.canshowonmap
                ? root.location || {
                    longitude: root.longitude,
                    latitude: root.latitude,
                }
                : null;
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

            const userShares = await context.dataSources.location.isMemberSharingLocation(context.principal.id);
            if (!userShares) {
                context.logger.log('member does not share location');
                return [];
            }

            return context.dataSources.location.query();
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
            const limit = context.getLimiter('location');
            const result = await limit.use(context.principal.id);

            if (result.rejected) {
                context.logger.log('too many putLocation');
                throw429();
            }

            context.logger.log('putLocation', args);
            const db = context.dataSources.location.putLocation(args.location);

            // events are sent directy offline, we have to wait for the db first in this case
            if (EXECUTING_OFFLINE) { await db; }

            // const canShowOnMap = await contextaph.dataSources.location.isMemberVisibleOnMap(context.principal.id);
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
                    sender: context.principal.id,
                    trackDelivery: false,
                    ttl: 60 * 60, // 1h
                    encrypted: false,
                    volatile:  true,
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
                const loc = await context.dataSources.location.userLocation();
                if (!loc) {
                    context.logger.log('location unkown??');
                    throw new Error('Location unkonwn');
                }

                const hash = Geohash.encode(loc.longitude, loc.latitude, 4);

                // we only subscribe to our circle
                const names = [`nearby:${hash}`];
                context.logger.log('subscribe', loc, names);

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
                        // we want to receive our own location updates
                        return EXECUTING_OFFLINE ? true : ctx.principal.id !== event.payload.member;
                    },
                )(root, args, context, image);
            },

            // tslint:disable-next-line: variable-name
            resolve: async (_channelMessage: WebsocketEvent<GeoCityLocation>, _args: {}, context: ISubscriptionContext, image: any) => {
                return LocationResolver.Query.nearbyMembers({}, image.variableValues, context);
            },
        },
    },
};
