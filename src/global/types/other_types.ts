import { Channel, TextChannel, ChannelType, EmbedBuilder } from 'discord.js';
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
const werewolf_role_id_arr = ['W00'] as const;
const villager_role_id_arr = ['V00'] as const;
const god_identity_role_id_arr = ['G00', 'G01', 'G02'] as const;
export type t_werewolf_role_id = typeof werewolf_role_id_arr[number];
export type t_villager_role_id = typeof villager_role_id_arr[number];
export type t_god_identity_role_id = typeof god_identity_role_id_arr[number];
export type t_role_id = t_werewolf_role_id | t_villager_role_id | t_god_identity_role_id;
// eslint-disable-next-line @typescript-eslint/typedef
export const fake_role_id = ['V00', 'G00'] as const;
export type t_fake_role_id = Extends<t_role_id, typeof fake_role_id[number]>;

export function isRoleId(query: string): query is t_role_id {
    return (werewolf_role_id_arr.includes(query as t_werewolf_role_id) || villager_role_id_arr.includes(query as t_villager_role_id) || god_identity_role_id_arr.includes(query as t_god_identity_role_id));
}
export function isFakeRoleId(query: string): query is t_fake_role_id {
    return (fake_role_id.includes(query as t_fake_role_id));
}
export function isWerewolfRoleId(query: string): query is t_werewolf_role_id {
    return (werewolf_role_id_arr.includes(query as t_werewolf_role_id));
}
export function isVillagerRoleId(query: string): query is t_villager_role_id {
    return (villager_role_id_arr.includes(query as t_villager_role_id));
}
export function isGodIdentityRoleId(query: string): query is t_god_identity_role_id {
    return (god_identity_role_id_arr.includes(query as t_god_identity_role_id));
}

// eslint-disable-next-line @typescript-eslint/typedef
export type t_game_match_status =
{status: 'guessing', guesses: t_role_id[], remaining_guesses: t_role_id[]} |
{status: 'night', selecting: {
    target1: number | null,
    target2: number | null,
    ability: number | null
}, actions: {
    target1: number,
    target2: number,
    ability: number
}[]} |
{status: 'day_vote', lynch: number | null} |
{status: 'hunter_night' | 'hunter_day', target: number | null}

// eslint-disable-next-line @typescript-eslint/typedef
export const game_match_state_arr = ['night', 'day_vote', 'hunter_night', 'hunter_day', 'guessing'] as const;
export type t_game_match_state = typeof game_match_state_arr[number];
export function isGameMatchState(query: string): query is t_game_match_state {
    return (game_match_state_arr.includes(query as t_game_match_state));
}

export type t_gameplay_embed = EmbedBuilder;