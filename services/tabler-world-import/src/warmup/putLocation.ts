import { ioRedisClient } from '../cache/ioRedisClient';

export async function putLocation({ longitude, latitude, member, lastseen, speed, address, accuracy }: any) {
    // const params = getNearByParams();
    const multi = await ioRedisClient.multi();

    // point
    multi.geoadd('nearby:geo', longitude, latitude, member.toString());

    // details of last location
    multi.set(`nearby:${member}`, {
        speed,
        address,
        accuracy,
        lastseen: lastseen.valueOf(),
        position: { longitude, latitude },
    });

    // newest members first
    multi.zadd('nearby:ttl', lastseen.valueOf(), member.toString());
    await multi.exec();
}
