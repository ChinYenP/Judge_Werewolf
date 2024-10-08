const display_text = require('../text_data_config/display_text.json');
const db = require('../database/sqlite_db.js');

/*
If return value after calling these functions are empty array, print the following default error text:
'DSPY error at ./___.js, no_'
Then display this to user before return:
"Something has gone wrong during the code runtime: Error DSPY"
How to check (example):
if (display_arr.length !== 1) {
    console.error("DSPY error at ./___.js, no1");
    //display error code and return
};
*/

//query_arr = [query_string1, query_string2, ...]
//return [answer_string1, answer_string2, ...]
async function get_display_text(query_arr, clientId) {
    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings = await db.USER_SETTINGS.findOne({ where: { clientId: clientId } });
    let language = '';
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
        };
    } else {
        //clientId not exist
        language = 'eng';
    };

    //Tranverse the display_text object
    try {
        const display_arr = [];
        for (const query_str of query_arr) {
            const query_keys = query_str.split('.');
            let display_ref = display_text;
            for (const key of query_keys) {
                display_ref = display_ref[key];
            };
            display_arr.push(display_ref[language]);
        };
        return (display_arr);
    }
    catch (err) {
        console.error(err);
        console.error('DSPY error at ./utility/get_display.js, no1');
        return ([]);
    };
};

async function get_display_error_code(error_code, clientId) {
    const display_arr = await get_display_text(['general.error.display'], clientId);
    if (display_arr.length !== 1) {
        console.error('DSPY error at ./utility/get_display.js, no2');
        return ([]);
    };
    return ([display_arr[0] + error_code]);
};

module.exports = { get_display_text, get_display_error_code };