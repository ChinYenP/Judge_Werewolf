const display_text = require('../../display_text.json');
const db = require('../../sqlite_db.js');

//query_arr = [query_string1, query_string2, ...]
async function get_display_text(query_arr, clientId) {
    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings = await db.USER_SETTINGS.findOne({ where: { clientId: clientId } });
    let language = "";
    if (settings !== null) {
        //clientId exist
        switch(settings.lang) {
            case "eng":
                language = "eng";
                break;
            case "malay":
                language = "malay";
                break;
            case "schi":
                language = "schi";
                break;
            case "tchi":
                language = "tchi";
                break;
            case "yue":
                language = "yue";
                break;
            default:
                return ([]);
        };
    } else {
        //clientId not exist
        language = "eng";
    };

    //Tranverse the display_text object
    try {
        let display_arr = [];
        for (let query_str of query_arr) {
            let query_keys = query_str.split(".");
            let display_ref = display_text;
            for (let key of query_keys) {
                display_ref = display_ref[key];
            };
            display_arr.push(display_ref[language]);
        };
        return (display_arr);
    }
    catch(err) {
        console.error(err);
        return ([]);
    };
};

module.exports = { get_display_text };