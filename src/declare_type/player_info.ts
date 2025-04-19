import { t_role_id, t_fake_role_id } from './type_guard.js';

export type ExtraInfo<T extends t_role_id> =
    T extends 'W00' ? { role_id: T; act: t_fake_role_id } //What role to act
    : T extends 'G01' ? { role_id: T; target: number } //Who to aim the gun at
    : { role_id: T };

export interface i_player_info {
    role_id: t_role_id;
    dead: boolean;
    sheriff: boolean;
    target: [number, number]; //[target_player, ability_num]
    extra_info: ExtraInfo<this['role_id']>;
};