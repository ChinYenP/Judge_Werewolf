const db = require('../sqlite_db.js');
const { command_validation } = require('./validation/command_validation.js');

async function check_cooldown(clientId, command) {

    //Check command
    if (!(await command_validation(command))) {
        console.error('Command not found during validation in cooldown.js');
        return (['command_not_validate']);
    };

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings = await db.COMMAND_COOLDOWN.findOne({ where: { clientId: clientId, command: command } });
    if (settings !== null) {
        //data exist
        const expired_date = settings.expired_date;
        const date_now = Date.now();
        if (date_now < expired_date) {
            return (['cooldown_not_over', parseFloat((expired_date - date_now) / 1000)]);
        };
    };
    return (['cooldown_over']);
};

async function update_cooldown(clientId, command, time_sec) {

    //Check command
    if (!(await command_validation(command))) {
        console.error('Command not found during validation in cooldown.js');
        return ('command_not_validate');
    };

    const expired_date = Date.now() + (time_sec * 1000);

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings = await db.COMMAND_COOLDOWN.findOne({ where: { clientId: clientId, command: command } });
    if (settings !== null) {
        //data exist
        const affectedRows = await db.COMMAND_COOLDOWN.update({ expired_date: expired_date }, { where: { clientId: clientId, command: command } });
        if (affectedRows > 0) {
            return 'success';
        };
        return 'err modify data';
    };
    //Data not exist
    try {
        // equivalent to: INSERT INTO SETTINGS (clientId, lang, hardMode) values (?, ?, ?);
        await db.COMMAND_COOLDOWN.create({
            clientId: clientId,
            command: command,
            expired_date: expired_date
        });
        return 'success';
    }
    catch (error) {
        console.log(error);
        return 'err insert data';
    };
};

module.exports = { check_cooldown, update_cooldown };