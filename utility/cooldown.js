const db = require('../database/sqlite_db.js');
const { command_validation } = require('./validation/command_validation.js');

async function check_cooldown(clientId, command, time_sec) {

    /*Return array:
    [0, <float>] - cooldown is not over, next element represents remaining time.
    [1] - cooldown is over, cooldown will be updated automatically.
    [2, <str>] - error encountered, next element represents error code.
    */

    //Check command
    if (!(await command_validation(command))) {
        return ([2, 'C4']);
    };

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings = await db.COMMAND_COOLDOWN.findOne({ where: { clientId: clientId, command: command } });
    if (settings !== null) {
        //data exist
        const expired_date = settings.expired_date;
        const date_now = Date.now();
        if (date_now < expired_date) {
            return ([0, parseFloat((expired_date - date_now) / 1000)]);
        };
    };
    return (await update_cooldown(clientId, command, time_sec));
};

async function update_cooldown(clientId, command, time_sec) {

    //Check command
    if (!(await command_validation(command))) {
        return ([2, 'C4']);
    };

    const expired_date = Date.now() + (time_sec * 1000);

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings = await db.COMMAND_COOLDOWN.findOne({ where: { clientId: clientId, command: command } });
    if (settings !== null) {
        //data exist
        const affectedRows = await db.COMMAND_COOLDOWN.update({ expired_date: expired_date }, { where: { clientId: clientId, command: command } });
        if (affectedRows > 0) {
            return ([1]);
        };
        return ([2, 'D3']);
    };
    //Data not exist
    try {
        // equivalent to: INSERT INTO SETTINGS (clientId, lang, hardMode) values (?, ?, ?);
        await db.COMMAND_COOLDOWN.create({
            clientId: clientId,
            command: command,
            expired_date: expired_date
        });
        return ([1]);
    }
    catch (error) {
        console.log(error);
        return ([2, 'D1']);
    };
};

module.exports = { check_cooldown };