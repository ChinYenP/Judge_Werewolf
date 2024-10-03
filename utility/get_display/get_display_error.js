const { get_display_text } = require('./get_display_text.js');
const display_text = require('../../display_text.json');

async function get_display_error(error_type, clientId) {
    let text = '';
    let display_arr = '';
    switch (error_type) {
        case 'insert_data':
            display_arr = await get_display_text(['general.error.display'], clientId);
            if (display_arr.length !== 1) {
                return ([]);
            };
            text = display_arr[0] + display_text.general.error.error_code.database.insert_data;
            break;
        case 'delete_data':
            display_arr = await get_display_text(['general.error.display'], clientId);
            if (display_arr.length !== 1) {
                return ([]);
            };
            text = display_arr[0] + display_text.general.error.error_code.database.delete_data;
            break;
        case 'modify_data':
            display_arr = await get_display_text(['general.error.display'], clientId);
            if (display_arr.length !== 1) {
                return ([]);
            };
            text = display_arr[0] + display_text.general.error.error_code.database.modify_data;
            break;
        case 'search_data':
            display_arr = await get_display_text(['general.error.display'], clientId);
            if (display_arr.length !== 1) {
                return ([]);
            };
            text = display_arr[0] + display_text.general.error.error_code.database.search_data;
            break;
        case 'undefined_prefix':
            display_arr = await get_display_text(['general.error.display'], clientId);
            if (display_arr.length !== 1) {
                return ([]);
            };
            text = display_arr[0] + display_text.general.error.error_code.command.undefined_prefix;
            break;
        case 'error_execute_cmd':
            display_arr = await get_display_text(['general.error.display'], clientId);
            if (display_arr.length !== 1) {
                return ([]);
            };
            text = display_arr[0] + display_text.general.error.error_code.command.error_execute_cmd;
            break;
        case 'select_menu':
            display_arr = await get_display_text(['general.error.display'], clientId);
            if (display_arr.length !== 1) {
                return ([]);
            };
            text = display_arr[0] + display_text.general.error.error_code.select_menu;
            break;
        case 'less_args':
            display_arr = await get_display_text(['general.command_args_error.less_args'], clientId);
            if (display_arr.length !== 1) {
                return ([]);
            };
            text = display_arr[0];
            break;
        case 'wrong_args':
            display_arr = await get_display_text(['general.command_args_error.wrong_args'], clientId);
            if (display_arr.length !== 1) {
                return ([]);
            };
            text = display_arr[0];
            break;
        case 'much_args':
            display_arr = await get_display_text(['general.command_args_error.much_args'], clientId);
            if (display_arr.length !== 1) {
                return ([]);
            };
            text = display_arr[0];
            break;
        case 'not_administrator':
            display_arr = await get_display_text(['general.permission_error.not_administrator'], clientId);
            if (display_arr.length !== 1) {
                return ([]);
            };
            text = display_arr[0];
            break;
        case 'message_edit_error':
            display_arr = await get_display_text(['general.message_type_error.message_edit_error'], clientId);
            if (display_arr.length !== 1) {
                return ([]);
            };
            text = display_arr[0];
            break;
        case 'settings_prefix_invalid':
            display_arr = await get_display_text(['settings.server_settings.prefix.invalid_prefix'], clientId);
            if (display_arr.length !== 1) {
                return ([]);
            };
            text = display_arr[0];
            break;
        default:
            return ([]);
    };
    return ([text]);
};

module.exports = { get_display_error };