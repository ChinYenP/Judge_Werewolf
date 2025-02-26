import { display_text } from '../text_data_config/display_text.js';
import { UserSettingsInstance, USER_SETTINGS } from '../database/sqlite_db.js';
import { config } from '../text_data_config/config.js';


//query_arr = [query_string1, query_string2, ...]
//return [answer_string1, answer_string2, ...]
async function get_display_text(query_arr: string[], clientId: string): Promise<string[]> {
    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
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

export { get_display_text, get_display_error_code }