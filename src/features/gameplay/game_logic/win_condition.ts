import { t_game_rule, t_win_con } from "../../../global/types/list_str";
import { t_role_id } from "../../../global/types/other_types";
import { i_player_info } from '../../../global/types/player_info.js';

//async function win_condition() for general checking, including number of phases
function win_condition(players_info: i_player_info[], game_rule: t_game_rule, consecutive_no_death: number): t_win_con {
    const role_list: t_role_id[] = [];
    for (const each_player_info of players_info) {
        if (!(each_player_info.dead)) {
            role_list.push(each_player_info.role_id);
        }
    }
    const role_win_con: t_win_con = win_condition_in_role(role_list, game_rule);
    if (role_win_con !== 'unknown') return (role_win_con);
    if (consecutive_no_death <= 0) return ('tie');
    return ('unknown');
}

// Return unknown if still unable to determine the winner by roles only.
function win_condition_in_role(role_list: t_role_id[], game_rule: t_game_rule): t_win_con {
    let num_werewolves: number = 0;
    let num_villager: number = 0;
    let num_god_identities: number = 0;
    for (const role_id of role_list) {
        switch (role_id[0]) {
            case 'W':
                num_werewolves++;
                break;
            case 'V':
                num_villager++;
                break;
            case 'G':
                num_god_identities++;
                break;
        }
    }
    if (num_werewolves === 0) {
        return ('village');
    }
    if (game_rule === 'kill_all') {
        if (num_god_identities + num_villager === 0) {
            return ('werewolf');
        }
    } else {
        if (num_god_identities === 0 || num_villager === 0) {
            return ('werewolf');
        }
    }
    return ('unknown');
}

export { win_condition, win_condition_in_role }