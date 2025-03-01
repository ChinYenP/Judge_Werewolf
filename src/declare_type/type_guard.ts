import { Channel, TextChannel, Client } from 'discord.js';
import { MyClient } from '../index';

function isTextChannel(channel: Channel): channel is TextChannel {
    return (channel as TextChannel).guild !== undefined;
}

function isMyClient(client: Client): client is MyClient {
    return (client as MyClient).commands !== undefined;
}

const valid_role_id: string[] = ['W00', 'V00', 'G00', 'G01'] as const;
type t_role_id = typeof valid_role_id[number];
function isRoleId(query: string): query is t_role_id {
    return (valid_role_id.includes(query as t_role_id));
}

export { isTextChannel, isMyClient, t_role_id, isRoleId }