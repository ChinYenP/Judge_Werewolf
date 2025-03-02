import { t_role_id } from "../../declare_type/type_guard";

//async function win_condition() for general checking, including number of phases

// Return tie if still unable to determine the winner by roles only.
async function win_condition_in_role(role_list: t_role_id[], game_rule: t_game_rule): Promise<t_win_con> {
    let num_werewolves = 0;
    let num_villager = 0;
    let num_god_identities = 0;
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
    return ('tie');
}

export { win_condition_in_role }