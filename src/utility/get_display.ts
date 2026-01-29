import { display_text } from '../global/display_text.js';
import { UserSettingsInstance, USER_SETTINGS } from '../global/sqlite_db.js';
import { display_error_str } from '../global/config.js';
import { t_role_id } from '../global/types/other_types.js';
import { t_languages, isLanguages, t_error_code, t_game_rule } from '../global/types/list_str.js';
import { DisplayTextType, isDisplayText, isDisplayTestUnit } from '../global/types/recursive_record.js';
import { compareRoleCount } from './compareFn.js';

//query_arr = [query_string1, query_string2, ...]
//return [answer_string1, answer_string2, ...], unless error: []
async function get_display_text(query_arr: string[], clientId: string): Promise<string[]> {
    const settings: UserSettingsInstance | null = await USER_SETTINGS.findOne({ where: { clientId: clientId } });
    let language: t_languages;
    if (settings !== null) {
        if (isLanguages(settings.lang)) {
            language = settings.lang;
        } else {
            language = 'eng';
        }
    } else {
        language = 'eng';
    }
    //Tranverse the display_text object
    try {
        const display_arr: string[] = [];
        for (const query_str of query_arr) {
            const query_keys: string[] = query_str.split('.');
            let display_ref: DisplayTextType = display_text;
            let has_error: boolean = false;
            for (const key of query_keys) {
                if (!isDisplayText(display_ref[key])) {
                    display_arr.push(display_error_str); //Error
                    has_error = true;
                    break;
                }
                display_ref = display_ref[key];
            }
            if (has_error) continue;
            if (!isDisplayTestUnit(display_ref)) {
                display_arr.push(display_error_str); //Error
                continue;
            }
            const val: string | undefined = display_ref[language];
            if (typeof val === 'string') {
                display_arr.push(val);
            } else {
                //Error, fall back to English
                console.error(val);
                display_arr.push(display_ref.eng);
            }
        }
        if (display_arr.length != query_arr.length) {
            console.error(display_arr);
            while (display_arr.length < query_arr.length) {
                display_arr.push(display_error_str);
            }
            while (display_arr.length > query_arr.length) {
                display_arr.pop();
            }
        }
        return (display_arr);
    }
    catch (err) {
        console.error(err);
        const display_arr: string[] = [];
        while (display_arr.length < query_arr.length) {
            display_arr.push(display_error_str);
        }
        return (display_arr);
    }
}

async function get_display_error_code(error_code: t_error_code, clientId: string): Promise<string> {
    const [error_desc_text]: string[] = await get_display_text(['general.error.discription'], clientId);
    return (`${error_desc_text ?? display_error_str}${error_code}`);
}

async function get_game_text(role_id: t_role_id, query_str: string, clientId: string): Promise<string> {
    return ((await get_display_text([`game_text.${role_id}.${query_str}`], clientId))[0] ?? display_error_str);
}

function get_role_list_order(role_list: t_role_id[]): [t_role_id, number][] {
    const role_set: Set<t_role_id> = new Set<t_role_id>();
    const new_role_list: [t_role_id, number][] = [];
    for (const role_id of role_list) {
        if (role_set.has(role_id)) {
            let i: number = 0;
            for (const [role_id_i, _] of new_role_list) {
                if (role_id_i === role_id) break;
                i++;
            }
            (new_role_list[i]!)[1]++;
        } else {
            new_role_list.push([role_id, 1]);
            role_set.add(role_id);
        }
    }
    return (new_role_list.sort(compareRoleCount));
}

function get_game_id(data: {
    'num_roles_max': number,
    'sheriff': boolean,
    'game_rule': t_game_rule,
    'roles_list': t_role_id[]}): string {
    
    const role_order: [t_role_id, number][] = get_role_list_order(data.roles_list);
    let game_id: string = "S";
    if (data.num_roles_max < 10) {
        game_id += `0${String(data.num_roles_max)}`;
    } else {
        game_id += String(data.num_roles_max);
    }
    if (!data.sheriff) {
        game_id += '0';
    } else {
        game_id += '1';
    }
    if (data.game_rule === 'kill_all') {
        game_id += 'A';
    } else {
        game_id += 'E';
    }

    for (const [each_role_id, count] of role_order) {
        game_id += each_role_id;
        if (count < 10) {
            game_id += `0${String(count)}`;
        } else {
            game_id += String(count);
        }
    }
    game_id += 'L';
    return (game_id);
}

export { get_display_text, get_display_error_code, get_game_text, get_role_list_order, get_game_id }