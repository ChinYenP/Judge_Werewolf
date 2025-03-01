import { isRoleId, t_role_id } from '../../declare_type/type_guard.js';

async function game_id_validation(game_id: string): Promise<[boolean, {} | {
    'num_roles': number,
    'sheriff': boolean,
    'game_rule': t_game_rule,
    'roles_list': t_role_id[]}]> {
    
        let data: {
            'num_roles_max': number,
            'sheriff': boolean,
            'game_rule': t_game_rule,
            'roles_list': t_role_id[]
        } = {
            'num_roles_max': 0,
            'sheriff': false,
            'game_rule': 'kill_all',
            'roles_list': []
        }
    
    if (game_id.length < 6 || game_id.length > 66) return ([false, {}]);
    if (game_id[0] !== 'S' || game_id[game_id.length - 1] !== 'L') return ([false, {}]);
    if (!(['0','1'].includes(game_id[1] as string)) || !(['0','1','2','3','4','5','6','7','8','9'].includes(game_id[2] as string))) return ([false, {}]);
    if (Number(`${game_id[1]}${game_id[2]}`) < 6 || Number(`${game_id[1]}${game_id[2]}`) > 12) return ([false, {}]);
    data['num_roles_max'] = Number(`${game_id[1]}${game_id[2]}`);

    if (game_id[3] === '0') {
        data['sheriff'] = false;
    } else if (game_id[3] === '1') {
        data['sheriff'] = true;
    } else {
        return ([false, {}]);
    }

    if (game_id[4] === 'A') {
        data['game_rule'] = 'kill_all';
    } else if (game_id[4] === 'E') {
        data['game_rule'] = 'kill_either';
    } else {
        return ([false, {}]);
    }

    let num_roles: number = 0;
    for (let i: number = 5; i < game_id.length - 1; i += 5) {
        if (i + 4 >= game_id.length - 1) return ([false, {}]);
        if (!isRoleId(`${game_id[i]}${game_id[i+1]}${game_id[i+2]}`)) return ([false, {}]);
        if (!(['0','1'].includes(game_id[i+3] as string)) || !(['0','1','2','3','4','5','6','7','8','9'].includes(game_id[i+4] as string))) return ([false, {}]);
        if (Number(`${game_id[i+3]}${game_id[i+4]}`) < 1 || Number(`${game_id[i+3]}${game_id[i+4]}`) > 12) return ([false, {}]);
        for (let j = 0; j < Number(`${game_id[i+3]}${game_id[i+4]}`); j++) {
            data['roles_list'].push(`${game_id[i]}${game_id[i+1]}${game_id[i+2]}`);
        }
        num_roles += Number(`${game_id[i+3]}${game_id[i+4]}`);
        if (num_roles > data['num_roles_max']) return ([false, {}]);
    }

    return ([true, data]);
}

export { game_id_validation }