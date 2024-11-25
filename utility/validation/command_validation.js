//You should not fail this normally...
async function command_validation(command, bot_client_instance) {
    if (command === 'overall') return (true);
    try {
        return (await bot_client_instance.commands.has(command));
    } catch (error) {
        console.error(error);
        return (false);
    };
};

module.exports = { command_validation };