const { Events } = require('discord.js');
const { prefix_validation } = require('../utility/validation/prefix_validation.js');
const { get_display_error_code } = require('../utility/get_display.js');
const db = require('../database/sqlite_db.js');
const config = require('../text_data_config/config.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
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
            console.error('C3 error at ./events/MessageCreate.js, no1');
        };

        // Check if the message starts with the prefix or sent by a bot
        if (!(message.content.startsWith(preset_prefix) || message.content.startsWith(clientMention)) || message.author.bot) {
            return;
        };

        let args = [];
        if (message.content.startsWith(preset_prefix)) {
            args = message.content.slice(preset_prefix.length).trim().split(/ +/);
        } else if (message.content.startsWith(clientMention)) {
            args = message.content.slice(clientMention.length).trim().split(/ +/);
        } else {
            await message.reply(await get_display_error_code('C3', message.author.id));
            console.error('C3 error at ./events/MessageCreate.js, no2');
        };
        const commandName = args.shift().toLowerCase();
        const command = message.client.commands.get(commandName);
        
        if (!command) {
            await message.reply(`Command ${commandName} does not exist.`);
            console.error(`No command matching ${commandName} was found.`);
            return;
        };

        try {
            await command.execute(message, args);
        } catch (error) {
            await message.reply(await get_display_error_code('C2', message.author.id));
            console.error('C2 error at ./events/MessageCreate.js, no1');
            console.error(error);
        };
    },
};