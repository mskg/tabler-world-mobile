import { Channel, ChannelMessageRoot } from '../models/Channel';

const publish = (channel: string, data: ChannelMessageRoot) => {
    return new Channel(channel).postMessage(data);
};

export default publish;
