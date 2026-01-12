import { isRoleId, t_role_id } from '../../global/types/other_types.js';
import { t_game_rule } from '../../global/types/list_str.js';
import { get_display_text } from '../get_display.js';
import { display_error_str } from '../../global/config.js';
import { assertCharIndex } from '../assert.js';

async function game_id_validation(game_id: string, clientId: string): Promise<{valid: false, error_msg: string} | {valid: true, datas: {
    'num_roles_max': number,
    'sheriff': boolean,
    'game_rule': t_game_rule,
    'roles_list': t_role_id[]}}> {
    
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
        return ({valid: false, error_msg: error_text ?? display_error_str});
    }
    if (!game_id.startsWith('S') || !game_id.endsWith('L')) {
        const [error_text] = await get_display_text(['game_id.invalid_embed.start_last'], clientId);
        return ({valid: false, error_msg: error_text ?? display_error_str});
    }
    if (!(['0','1'].includes(assertCharIndex(game_id,1))) || !(['0','1','2','3','4','5','6','7','8','9'].includes(assertCharIndex(game_id,2)))) {
        const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_num_roles'], clientId);
        return ({valid: false, error_msg: error_text ?? display_error_str});
    }
    if (Number(`${assertCharIndex(game_id,1)}${assertCharIndex(game_id,2)}`) < 6 || Number(`${assertCharIndex(game_id,1)}${assertCharIndex(game_id,2)}`) > 12) {
        const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_num_roles'], clientId);
        return ({valid: false, error_msg: error_text ?? display_error_str});
    }
    data.num_roles_max = Number(`${assertCharIndex(game_id,1)}${assertCharIndex(game_id,2)}`);

    if (game_id[3] === '0') {
        data.sheriff = false;
    } else if (game_id[3] === '1') {
        data.sheriff = true;
    } else {
        const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_sheriff'], clientId);
        return ({valid: false, error_msg: error_text ?? display_error_str});
    }

    if (game_id[4] === 'A') {
        data.game_rule = 'kill_all';
    } else if (game_id[4] === 'E') {
        data.game_rule = 'kill_either';
    } else {
        const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_game_rule'], clientId);
        return ({valid: false, error_msg: error_text ?? display_error_str});
    }

    let num_roles: number = 0;
    for (let i: number = 5; i < game_id.length - 1; i += 5) {
        if (i + 4 >= game_id.length - 1) {
            const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_role_id'], clientId);
            return ({valid: false, error_msg: `${error_text ?? display_error_str}${game_id.slice(i, game_id.length - 1)}`});
        }
        const role_id: string = `${assertCharIndex(game_id,i)}${assertCharIndex(game_id,i+1)}${assertCharIndex(game_id,i+2)}`;
        if (!isRoleId(role_id)) {
            const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_role_id'], clientId);
            return ({valid: false, error_msg: `${error_text ?? display_error_str}${assertCharIndex(game_id,i)}${assertCharIndex(game_id,i+1)}${assertCharIndex(game_id,i+2)}${assertCharIndex(game_id,i+3)}${assertCharIndex(game_id,i+4)}`});
        }
        if (!(['0','1'].includes(assertCharIndex(game_id,i+3))) || !(['0','1','2','3','4','5','6','7','8','9'].includes(assertCharIndex(game_id,i+4)))) {
            const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_role_id'], clientId);
            return ({valid: false, error_msg: `${error_text ?? display_error_str}${assertCharIndex(game_id,i)}${assertCharIndex(game_id,i+1)}${assertCharIndex(game_id,i+2)}${assertCharIndex(game_id,i+3)}${assertCharIndex(game_id,i+4)}`});
        }
        const num_this_role: number = Number(`${assertCharIndex(game_id,i+3)}${assertCharIndex(game_id,i+4)}`);
        if (num_this_role < 1 || num_this_role > 12) {
            const [error_text] = await get_display_text(['game_id.invalid_embed.invalid_role_id'], clientId);
            return ({valid: false, error_msg: `${error_text ?? display_error_str}${assertCharIndex(game_id,i)}${assertCharIndex(game_id,i+1)}${assertCharIndex(game_id,i+2)}${assertCharIndex(game_id,i+3)}${assertCharIndex(game_id,i+4)}`});
        }
        for (let j: number = 0; j < num_this_role; j++) {
            data.roles_list.push(role_id);
        }
        num_roles += num_this_role;
        if (num_roles > data.num_roles_max) {
            const [error_text] = await get_display_text(['game_id.invalid_embed.exceed_max_num_player'], clientId);
            return ({valid: false, error_msg: error_text ?? display_error_str});
        }
    }

    return ({valid: true, datas: data});
}

export { game_id_validation }