import { Channel, TextChannel, ChannelType } from 'discord.js';
import { t_error_code } from './list_str.js';

export function isTextChannel(channel: Channel): channel is TextChannel {
    return (channel.type === ChannelType.GuildText);
}

export type t_cooldown_status = {
    status: 'ok'
} | {
    status: 'cooldown',
    remaining_sec: number
} | {
    status: 'fatal',
    error_code: t_error_code
}

type Extends<T, U extends T> = U;

// eslint-disable-next-line @typescript-eslint/typedef
const valid_role_id = ['W00', 'V00', 'G00', 'G01'] as const;
export type t_role_id = typeof valid_role_id[number];
// eslint-disable-next-line @typescript-eslint/typedef
export const fake_role_id = ['V00', 'G00'] as const;
export type t_fake_role_id = Extends<t_role_id, typeof fake_role_id[number]>;

export function isRoleId(query: string): query is t_role_id {
    return (valid_role_id.includes(query as t_role_id));
}
export function isFakeRoleId(query: string): query is t_fake_role_id {
    return (fake_role_id.includes(query as t_fake_role_id));
}