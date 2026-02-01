import { t_role_id, t_fake_role_id, t_game_match_state } from "../../../global/types/other_types.js";
import { i_player_info } from '../../../global/types/player_info.js';
import { randomise_array } from "../../../utility/randomise_array.js";

function start_turn_order(_role_list: t_role_id[]): t_game_match_state[] {
    const turn_order: t_game_match_state[] = [];
    //If there are roles that has actions at the start of the game, place them before night.
    turn_order.push('night');
    return (turn_order);
}

function start_num_ability(role_list: t_role_id[]): number {
    let ability: number = 1;
    for (const role of role_list) {
        if (role === 'G02') {
            ability = 2;
        }
    }
    return (ability);
}

async function start_players_info(role_list: t_role_id[], fake_role_list: t_fake_role_id[]): Promise<i_player_info[]> {
    
    let players_info: i_player_info[] = [];
    for (const each_role_id of role_list) {
        let player_info: i_player_info;
        switch (each_role_id) {
            case 'W00':
                player_info = {
                    role_id: each_role_id,
                    dead: false,
                    sheriff: false,
                    extra_info: { role_id: each_role_id, act: random_fake_role(fake_role_list) }
                }
                break;
            case 'W01':
                player_info = {
                    role_id: each_role_id,
                    dead: false,
                    sheriff: false,
                    extra_info: { role_id: each_role_id, act: random_fake_role(fake_role_list) }
                }
                break;
            case 'V00':
                player_info = {
                    role_id: each_role_id,
                    dead: false,
                    sheriff: false,
                    extra_info: { role_id: each_role_id }
                };
                break;
            case 'G00':
                player_info = {
                    role_id: each_role_id,
                    dead: false,
                    sheriff: false,
                    extra_info: { role_id: each_role_id }
                };
                break;
            case 'G01':
                player_info = {
                    role_id: each_role_id,
                    dead: false,
                    sheriff: false,
                    extra_info: { role_id: each_role_id, target: null, witch_poisoned: false }
                }
                break;
            case 'G02':
                player_info = {
                    role_id: each_role_id,
                    dead: false,
                    sheriff: false,
                    extra_info: { role_id: each_role_id, heal: true, poison: true }
                };
                break;
            case 'G03':
                player_info = {
                    role_id: each_role_id,
                    dead: false,
                    sheriff: false,
                    extra_info: { role_id: each_role_id, prev_protect: null }
                };
                break;
        }
        players_info.push(player_info);
    }
    players_info = randomise_array<i_player_info>(players_info);
    console.log(players_info);
    return (players_info);


    function random_fake_role(fake_role_list: t_fake_role_id[]): t_fake_role_id {
        return (fake_role_list[Math.floor(Math.random() * fake_role_list.length)] ?? 'V00');
    }
}

export { start_turn_order, start_num_ability, start_players_info }