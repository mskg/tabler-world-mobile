import { ioRedisClient } from '../cache/ioRedisClient';

export async function putLocation({ family, longitude, latitude, member, lastseen, speed, address, accuracy }: any) {
    // const params = getNearByParams();
    const multi = await ioRedisClient.multi();

    // point
    multi.geoadd(`nearby:geo:${family}`, longitude, latitude, member.toString());

    // details of last location
    multi.set(`nearby:${member}`, {
        speed,
        address,
        accuracy,
        lastseen: lastseen.valueOf(),
        location: { longitude, latitude },
    });

    // newest members first
    multi.zadd('nearby:ttl', lastseen.valueOf(), member.toString());
    await multi.exec();
}
