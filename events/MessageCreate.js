const { Events } = require('discord.js');
const db = require('../sqlite_db.js');
const { prefix_validation } = require('../utility/validation/prefix_validation.js');

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
            preset_prefix = 'bat';
        };
        //Validate prefix
        if (!(prefix_validation(preset_prefix))) {
            await message.reply('Something is wrong related to prefix.');
            console.error(`Prefix in the guild ${message.guildId} has wrong format: ${  preset_prefix}`);
        };

        // Check if the message starts with the prefix or sent by a bot
        if (!(message.content.startsWith(preset_prefix) || message.content.startsWith(clientMention)) || message.author.bot) return;

        let args = [];
        if (message.content.startsWith(preset_prefix)) {
            args = message.content.slice(preset_prefix.length).trim().split(/ +/);
        } else if (message.content.startsWith(clientMention)) {
            args = message.content.slice(clientMention.length).trim().split(/ +/);
        } else {
            console.error('Something wrong by identifying prefix.');
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
            console.error(`Error executing ${commandName}`);
            console.error(error);
        };
    },
};