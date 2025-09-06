import { Channel, TextChannel } from 'discord.js';
import { t_error_code } from './list_str.js';

function isTextChannel(channel: Channel): channel is TextChannel {
    return (channel as TextChannel).guild !== undefined;
}

type t_cooldown_status = {
    status: 'ok'
} | {
    status: 'cooldown',
    remaining_sec: number
} | {
    status: 'fatal',
    error_code: t_error_code
}

type Extends<T, U extends T> = U;

const valid_role_id = ['W00', 'V00', 'G00', 'G01'] as const;
type t_role_id = typeof valid_role_id[number];
const fake_role_id = ['V00', 'G00'] as const;
type t_fake_role_id = Extends<t_role_id, typeof fake_role_id[number]>;

function isRoleId(query: string): query is t_role_id {
    return (valid_role_id.includes(query as t_role_id));
}

export { isTextChannel, t_role_id, isRoleId, t_fake_role_id, fake_role_id, t_cooldown_status }