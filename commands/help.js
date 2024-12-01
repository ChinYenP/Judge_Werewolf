const { check_cooldown } = require('../utility/cooldown.js');
const { get_display_text, get_display_error_code } = require('../utility/get_display.js');
const config = require('../text_data_config/config.json');

module.exports = {

    name: 'help',
    cooldown_sec: config.cooldown_sec.help,
    timeout: false,
    async execute(message, args) {
        console.log(`Help command ran, args: ${args}`);

        const clientId = message.author.id;
        if (!await check_cooldown(clientId, this.name, this.cooldown_sec, message.client, message)) {
            return;
        };

        const display_arr = await get_display_text(['help'], clientId);
        if (display_arr.length !== 1) {
            console.error('DSPY error at ./commands/help.js, no6');
            await message.reply('Something has gone wrong during the code runtime: Error DSPY');
            return;
        };

        await message.reply(display_arr[0]);
    },

};