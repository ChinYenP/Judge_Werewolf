const myEmitter = require('../../emitter.js');
const { Collection } = require('discord.js');

async function command_validation(command) {
    let commands_collection = new Collection();
    try {
        const getCommandsPromise = new Promise((resolve) => {
            myEmitter.emit('getCommands', resolve);
        });
        // Call the function and log the latency
        getCommandsPromise.then((commands) => {
            commands_collection = commands;
        });
    } catch(error) {
        console.error(error);
        return;
    };
    if (commands_collection.has(command)) {
        return (true);
    };
    return (false);
};

module.exports = { command_validation };