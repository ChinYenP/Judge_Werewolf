import { isRoleId, t_role_id } from '../../global/types/other_types.js';
import { t_game_rule } from '../../global/types/list_str.js';
import { get_display_text } from '../get_display.js';
import { display_error_str } from '../../global/config.js';
async function game_id_validation(game_id: string, clientId: string): Promise<[false, string] | [true, {
    'num_roles_max': number,
    'sheriff': boolean,
    'game_rule': t_game_rule,
    'roles_list': t_role_id[]}]> {
    
        const data: {
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
    
    if (game_id.length < 6 || game_id.length > 66) {
        const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_length'], clientId);
        return ([false, error_text ?? display_error_str]);
    }
    if (!game_id.startsWith('S') || !game_id.endsWith('L')) {
        const [error_text] = await get_display_text(['game_id.invalid_embed.start_last'], clientId);
        return ([false, error_text ?? display_error_str]);
    }
    if (!(['0','1'].includes(game_id[1]!)) || !(['0','1','2','3','4','5','6','7','8','9'].includes(game_id[2]!))) {
        const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_num_roles'], clientId);
        return ([false, error_text ?? display_error_str]);
    }
    if (Number(`${game_id[1]}${game_id[2]}`) < 6 || Number(`${game_id[1]}${game_id[2]}`) > 12) {
        const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_num_roles'], clientId);
        return ([false, error_text ?? display_error_str]);
    }
    data.num_roles_max = Number(`${game_id[1]}${game_id[2]}`);

    if (game_id[3] === '0') {
        data.sheriff = false;
    } else if (game_id[3] === '1') {
        data.sheriff = true;
    } else {
        const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_sheriff'], clientId);
        return ([false, error_text ?? display_error_str]);
    }

    if (game_id[4] === 'A') {
        data.game_rule = 'kill_all';
    } else if (game_id[4] === 'E') {
        data.game_rule = 'kill_either';
    } else {
        const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_game_rule'], clientId);
        return ([false, error_text ?? display_error_str]);
    }

    let num_roles = 0;
    for (let i = 5; i < game_id.length - 1; i += 5) {
        if (i + 4 >= game_id.length - 1) {
            const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_role_id'], clientId);
            return ([false, `${error_text}${game_id.slice(i, game_id.length - 1)}`]);
        }
        const role_id = `${game_id[i]}${game_id[i+1]}${game_id[i+2]}`;
        if (!isRoleId(role_id)) {
            const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_role_id'], clientId);
            return ([false, `${error_text}${game_id[i]}${game_id[i+1]}${game_id[i+2]}${game_id[i+3]}${game_id[i+4]}`]);
        }
        if (!(['0','1'].includes(game_id[i+3]!)) || !(['0','1','2','3','4','5','6','7','8','9'].includes(game_id[i+4]!))) {
            const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_role_id'], clientId);
            return ([false, `${error_text}${game_id[i]}${game_id[i+1]}${game_id[i+2]}${game_id[i+3]}${game_id[i+4]}`]);
        }
        if (Number(`${game_id[i+3]}${game_id[i+4]}`) < 1 || Number(`${game_id[i+3]}${game_id[i+4]}`) > 12) {
            const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_role_id'], clientId);
            return ([false, `${error_text}${game_id[i]}${game_id[i+1]}${game_id[i+2]}${game_id[i+3]}${game_id[i+4]}`]);
        }
        for (let j = 0; j < Number(`${game_id[i+3]}${game_id[i+4]}`); j++) {
            data.roles_list.push(role_id);
        }
        num_roles += Number(`${game_id[i+3]}${game_id[i+4]}`);
        if (num_roles > data.num_roles_max) {
            const [error_text] = await get_display_text(['game_id.invalid_embed.exceed_max_num_player'], clientId);
            return ([false, error_text ?? display_error_str]);
        }
    }

    return ([true, data]);
}

export { game_id_validation }