import { Channel, TextChannel, Client } from 'discord.js';
import { MyClient } from '../index';

function isTextChannel(channel: Channel): channel is TextChannel {
    return (channel as TextChannel).guild !== undefined;
}

function isMyClient(client: Client): client is MyClient {
    return (client as MyClient).commands !== undefined;
}

export { isTextChannel, isMyClient }