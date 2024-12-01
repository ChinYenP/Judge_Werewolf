const db = require('../database/sqlite_db.js');
const { command_validation } = require('./validation/command_validation.js');
const { get_display_text, get_display_error_code } = require('./get_display.js');

async function check_cooldown(clientId, command, time_sec, bot_client_instance, msg_interact_instance) {

    //Check command
    if (!(await command_validation(command, bot_client_instance))) {
        const display_arr = await get_display_error_code('C4', clientId);
        if (display_arr.length !== 1) {
            console.error(`DSPY error at ${command} in cooldown.js, no1`);
            await msg_interact_instance.reply('Something has gone wrong during the code runtime: Error DSPY');
            return (false);
        };
        console.error(`C4 error at ${command} in cooldown.js, no2`);
        await msg_interact_instance.reply(display_arr[0]);
        return (false);
    };

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings = await db.COMMAND_COOLDOWN.findOne({ where: { clientId: clientId, command: command } });
    if (settings !== null) {
        //data exist
        const expired_date = settings.expired_date;
        const date_now = Date.now();
        if (date_now < expired_date) {
            const display_arr = await get_display_text(['general.timeout_display'], clientId);
            if (display_arr.length !== 1) {
                console.error(`DSPY error at ${command} in cooldown.js, no3`);
                await msg_interact_instance.reply('Something has gone wrong during the code runtime: Error DSPY');
                return (false);
            };
            await msg_interact_instance.reply(`${display_arr[0] + parseFloat((expired_date - date_now) / 1000)}s`);
            return (false);
        };
    };
    return (await update_cooldown(clientId, command, time_sec, bot_client_instance, msg_interact_instance));
};

async function update_cooldown(clientId, command, time_sec, bot_client_instance, msg_interact_instance) {

    //Check command
    if (!(await command_validation(command, bot_client_instance))) {
        const display_arr = await get_display_error_code('C4', clientId);
        if (display_arr.length !== 1) {
            console.error(`DSPY error at ${command} in cooldown.js, no4`);
            await msg_interact_instance.reply('Something has gone wrong during the code runtime: Error DSPY');
            return (false);
        };
        console.error(`c$error at ${command} in cooldown.js, no5`);
        await msg_interact_instance.reply(display_arr[0]);
        return (false);
    };

    const expired_date = Date.now() + (time_sec * 1000);

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings = await db.COMMAND_COOLDOWN.findOne({ where: { clientId: clientId, command: command } });
    if (settings !== null) {
        //data exist
        const affectedRows = await db.COMMAND_COOLDOWN.update({ expired_date: expired_date }, { where: { clientId: clientId, command: command } });
        if (affectedRows > 0) {
            return (true);
        };
        const display_arr = await get_display_error_code('D3', clientId);
            if (display_arr.length !== 1) {
                console.error(`DSPY error at ${command} in cooldown.js, no6`);
                await msg_interact_instance.reply('Something has gone wrong during the code runtime: Error DSPY');
                return (false);
            };
            console.error(`D3 error at ${command} in cooldown.js, no7`);
            await msg_interact_instance.reply(display_arr[0]);
        return (false);
    };
    //Data not exist
    try {
        // equivalent to: INSERT INTO SETTINGS (clientId, lang, hardMode) values (?, ?, ?);
        await db.COMMAND_COOLDOWN.create({
            clientId: clientId,
            command: command,
            expired_date: expired_date
        });
        return (true);
    }
    catch (error) {
        console.log(error);
        const display_arr = await get_display_error_code('D1', clientId);
        if (display_arr.length !== 1) {
            console.error(`DSPY error at ${command} in cooldown.js, no8`);
            await msg_interact_instance.reply('Something has gone wrong during the code runtime: Error DSPY');
            return;
        };
        console.error(`D1 error at ${command} in cooldown.js, no9`);
        await msg_interact_instance.reply(display_arr[0]);
        return (false);
    };
};

module.exports = { check_cooldown };