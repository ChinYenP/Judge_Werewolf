import { display_text } from '../text_data_config/display_text.js';
import { UserSettingsInstance, USER_SETTINGS } from '../database/sqlite_db.js';
import { config } from '../text_data_config/config.js';
import { isRoleId, t_role_id } from '../declare_type/type_guard.js';
import { compareRoleCount } from './compareFn.js';

//query_arr = [query_string1, query_string2, ...]
//return [answer_string1, answer_string2, ...]
async function get_display_text(query_arr: string[], clientId: string): Promise<string[]> {
    const settings: UserSettingsInstance | null = await USER_SETTINGS.findOne({ where: { clientId: clientId } });
    let language: string = '';
    if (settings !== null) {
        //clientId exist
        switch (settings.lang) {
            case 'eng':
                language = 'eng';
                break;
            case 'malay':
                language = 'malay';
                break;
            case 'schi':
                language = 'schi';
                break;
            case 'tchi':
                language = 'tchi';
                break;
            case 'yue':
                language = 'yue';
                break;
            default:
                console.error('D5 error at ./utility/get_display.js, no1');
                return ([]);
        }
    } else {
        //clientId not exist
        language = 'eng';
    }

    //Tranverse the display_text object
    try {
        const display_arr: string[] = [];
        for (const query_str of query_arr) {
            const query_keys: string[] = query_str.split('.');
            let display_ref: DisplayTextType = display_text;
            for (const key of query_keys) {
                if (display_ref[key] === undefined || typeof display_ref[key] === 'string') {
                    console.error(display_ref[language]);
                    return ([]);
                }
                display_ref = display_ref[key];
            }
            if (typeof display_ref[language] !== 'string') {
                console.error(display_ref[language]);
                return ([]);
            }
            display_arr.push(display_ref[language] as string || config['display_error']);
        }
        return (display_arr);
    }
    catch (err) {
        console.error(err);
        console.error('DSPY error at ./utility/get_display.js, no1');
        return ([]);
    }
}

async function get_display_error_code(error_code: string, clientId: string): Promise<string> {
    const [error_desc_text]: string[] = await get_display_text(['general.error.discription'], clientId);
    return (`${error_desc_text}${error_code}`);
}

async function get_game_text(role_id: string, query_str: string, clientId: string): Promise<string> {
    if (!isRoleId(role_id)) return (config['display_error']);
    return ((await get_display_text([`game_text.${role_id}.${query_str}`], clientId))[0] ?? config['display_error']);
}

async function get_role_list_order(role_list: t_role_id[]): Promise<[t_role_id, number][]> {
    let role_set: Set<t_role_id> = new Set();
    let new_role_list: [t_role_id, number][] = [];
    for (const role_id of role_list) {
        if (role_set.has(role_id)) {
            let i = 0;
            for (const [role_id_i, _] of new_role_list) {
                if (role_id_i === role_id) break;
                i++;
            }
            (new_role_list[i] as [t_role_id, number])[1]++;
        } else {
            new_role_list.push([role_id, 1]);
            role_set.add(role_id);
        }
    }
    return (new_role_list.sort(compareRoleCount));
    
}

async function get_game_id(data: {
    'num_roles_max': number,
    'sheriff': boolean,
    'game_rule': t_game_rule,
    'roles_list': t_role_id[]}): Promise<string> {
    
    const role_order: [t_role_id, number][] = await get_role_list_order(data['roles_list']);
    let game_id: string = "S";
    if (data['num_roles_max'] < 10) {
        game_id += `0${data['num_roles_max']}`;
    } else {
        game_id += String(data['num_roles_max']);
    }
    if (data['sheriff'] === false) {
        game_id += '0';
    } else {
        game_id == '1';
    }
    if (data['game_rule'] === 'kill_all') {
        game_id += 'A';
    } else {
        game_id += 'E';
    }

    for (const [each_role_id, count] of role_order) {
        game_id += each_role_id;
        if (count < 10) {
            game_id += `0${count}`;
        } else {
            game_id += String(count);
        }
    }
    game_id += 'L';
    return (game_id);
}

export { get_display_text, get_display_error_code, get_game_text, get_role_list_order, get_game_id }