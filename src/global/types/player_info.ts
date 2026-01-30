import { t_fake_role_id, t_werewolf_role_id, t_villager_role_id, t_god_identity_role_id } from './other_types.js';

interface BasePlayerInfo {
    dead: boolean,
    sheriff: boolean
}

interface WerewolfPlayer extends BasePlayerInfo {
    role_id: t_werewolf_role_id;
    extra_info: {
        role_id: t_werewolf_role_id,
        act: t_fake_role_id;
    };
}
interface VillagerPlayer extends BasePlayerInfo {
    role_id: t_villager_role_id;
    extra_info: { role_id: t_villager_role_id }
}
interface GodIdentityPlayer extends BasePlayerInfo {
    role_id: t_god_identity_role_id;
    extra_info:
        | { role_id: 'G00' }
        | { role_id: 'G01', target: number | null, witch_poisoned: boolean }
        | { role_id: 'G02', heal: boolean, poison: boolean }
}

export type i_player_info = WerewolfPlayer | VillagerPlayer | GodIdentityPlayer;