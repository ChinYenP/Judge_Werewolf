const { Events } = require('discord.js');
const { check_cooldown } = require('../utility/cooldown.js');
const { prefix_validation } = require('../utility/validation/prefix_validation.js');
const { get_display_text, get_display_error_code } = require('../utility/get_display.js');
const db = require('../database/sqlite_db.js');
const config = require('../text_data_config/config.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {

        let display_arr = '';

        message.content = message.content.toLowerCase();
        let preset_prefix = '';
        const clientMention = message.client.user.toString();

        const settings = await db.SERVER_SETTINGS.findOne({ where: { guildId: message.guildId } });
        if (settings !== null) {
            //guildId exist
            preset_prefix = settings.prefix;
        } else {
            //guildId not exist
            preset_prefix = config.default_prefix;
        };
        //Validate prefix
        if (!(await prefix_validation(preset_prefix))) {
            await message.reply(await get_display_error_code('C3', message.author.id));
            console.error('C3 error at ./events/MessageCreate.js, no6');
        };

        // Check if the message starts with the prefix or sent by a bot
        if (!(message.content.startsWith(preset_prefix) || message.content.startsWith(clientMention)) || message.author.bot) {
            return;
        };

        const clientId = message.author.id;
        if (!await check_cooldown(clientId, 'overall', config.cooldown_sec.overall, message.client, message)) {
            return;
        };

        let args = [];
        if (message.content.startsWith(preset_prefix)) {
            args = message.content.slice(preset_prefix.length).trim().split(/ +/);
        } else if (message.content.startsWith(clientMention)) {
            args = message.content.slice(clientMention.length).trim().split(/ +/);
        } else {
            await message.reply(await get_display_error_code('C3', message.author.id));
            console.error('C3 error at ./events/MessageCreate.js, no7');
        };
        const commandName = args.shift().toLowerCase();
        if (commandName.length === 0) return;

        const command = message.client.commands.get(commandName);    
        if (!command) {
            display_arr = await get_display_text(['general.command_not_exist'], message.author.id);
            if (display_arr.length !== 1) {
                console.error('DSPY error at ./events/MessageCreate.js, no8');
                await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                return;
            };
            await message.reply(display_arr[0] + commandName);
            console.error(`No command matching ${commandName} was found.`);
            return;
        };

        try {
            await command.execute(message, args);
        } catch (error) {
            await message.reply(await get_display_error_code('C2', message.author.id));
            console.error('C2 error at ./events/MessageCreate.js, no9');
            console.error(error);
        };
    },
};