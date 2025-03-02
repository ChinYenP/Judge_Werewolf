import { isRoleId, t_role_id } from '../../declare_type/type_guard.js';
import { get_display_text } from '../get_display.js';
import { config } from '../../text_data_config/config.js';

async function game_id_validation(game_id: string, clientId: string): Promise<[boolean, {} | {
    'num_roles': number,
    'sheriff': boolean,
    'game_rule': t_game_rule,
    'roles_list': t_role_id[]}, string]> {
    
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
    
    if (game_id.length < 6 || game_id.length > 66) {
        const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_length'], clientId);
        return ([false, {}, error_text ?? config['display_error']]);
    }
    if (game_id[0] !== 'S' || game_id[game_id.length - 1] !== 'L') {
        const [error_text] = await get_display_text(['game_id.invalid_embed.start_last'], clientId);
        return ([false, {}, error_text ?? config['display_error']]);
    }
    if (!(['0','1'].includes(game_id[1] as string)) || !(['0','1','2','3','4','5','6','7','8','9'].includes(game_id[2] as string))) {
        const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_num_roles'], clientId);
        return ([false, {}, error_text ?? config['display_error']]);
    }
    if (Number(`${game_id[1]}${game_id[2]}`) < 6 || Number(`${game_id[1]}${game_id[2]}`) > 12) {
        const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_num_roles'], clientId);
        return ([false, {}, error_text ?? config['display_error']]);
    }
    data['num_roles_max'] = Number(`${game_id[1]}${game_id[2]}`);

    if (game_id[3] === '0') {
        data['sheriff'] = false;
    } else if (game_id[3] === '1') {
        data['sheriff'] = true;
    } else {
        const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_sheriff'], clientId);
        return ([false, {}, error_text ?? config['display_error']]);
    }

    if (game_id[4] === 'A') {
        data['game_rule'] = 'kill_all';
    } else if (game_id[4] === 'E') {
        data['game_rule'] = 'kill_either';
    } else {
        const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_game_rule'], clientId);
        return ([false, {}, error_text ?? config['display_error']]);
    }

    let num_roles: number = 0;
    for (let i: number = 5; i < game_id.length - 1; i += 5) {
        if (i + 4 >= game_id.length - 1) {
            const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_role_id'], clientId);
            return ([false, {}, `${error_text}${game_id.slice(i, game_id.length - 1)}`]);
        }
        if (!isRoleId(`${game_id[i]}${game_id[i+1]}${game_id[i+2]}`)) {
            const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_role_id'], clientId);
            return ([false, {}, `${error_text}${game_id[i]}${game_id[i+1]}${game_id[i+2]}${game_id[i+3]}${game_id[i+4]}`]);
        }
        if (!(['0','1'].includes(game_id[i+3] as string)) || !(['0','1','2','3','4','5','6','7','8','9'].includes(game_id[i+4] as string))) {
            const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_role_id'], clientId);
            return ([false, {}, `${error_text}${game_id[i]}${game_id[i+1]}${game_id[i+2]}${game_id[i+3]}${game_id[i+4]}`]);
        }
        if (Number(`${game_id[i+3]}${game_id[i+4]}`) < 1 || Number(`${game_id[i+3]}${game_id[i+4]}`) > 12) {
            const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_role_id'], clientId);
            return ([false, {}, `${error_text}${game_id[i]}${game_id[i+1]}${game_id[i+2]}${game_id[i+3]}${game_id[i+4]}`]);
        }
        for (let j = 0; j < Number(`${game_id[i+3]}${game_id[i+4]}`); j++) {
            data['roles_list'].push(`${game_id[i]}${game_id[i+1]}${game_id[i+2]}`);
        }
        num_roles += Number(`${game_id[i+3]}${game_id[i+4]}`);
        if (num_roles > data['num_roles_max']) {
            const [error_text] = await get_display_text(['game_id.invalid_embed.exceed_max_num_player'], clientId);
            return ([false, {}, error_text ?? config['display_error']]);
        }
    }

    return ([true, data, '']);
}

export { game_id_validation }