import { ChannelManager, ChannelMessageRoot } from '../models/ChannelManager';

const cm = new ChannelManager();

const publish = (channel: string, data: ChannelMessageRoot) => {
    return cm.postMessage(channel, data);
};

export default publish;
