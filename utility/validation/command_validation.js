const myEmitter = require('../emitter.js');

//You should not fail this normally...
async function command_validation(command) {
    try {
        const getCommandsPromise = new Promise((resolve) => {
            myEmitter.emit('getCommands', resolve);
        });
        const commands = await getCommandsPromise;
        return (commands.has(command));
    } catch (error) {
        console.error(error);
        return (false);
    };
};

module.exports = { command_validation };