import { Message, Events } from 'discord.js';
import { check_cooldown } from '../utility/cooldown.js';
import { prefix_validation } from '../utility/validation/prefix_validation.js';
import { get_display_text, get_display_error_code } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';
import { isMyClient } from '../declare_type/type_guard.js';
import { ServerSettingsInstance, SERVER_SETTINGS } from '../database/sqlite_db.js';

export default {
    name: Events.MessageCreate,
    once: false,
    async execute(message: Message): Promise<void> {

        const clientId: string = message.author.id;

        message.content = message.content.toLowerCase();
        let preset_prefix: string = '';
        const clientMention: string = message.client.user.toString();

        if (message.guildId === null) return;
        const settings: ServerSettingsInstance | null = await SERVER_SETTINGS.findOne({ where: { guildId: message.guildId } });
        if (settings !== null) {
            //guildId exist
            preset_prefix = settings.prefix;
        } else {
            //guildId not exist
            preset_prefix = config['default_prefix'];
        }
        //Validate prefix
        if (!(await prefix_validation(preset_prefix))) {
            await message.reply((await get_display_error_code('C3', clientId)) ?? config['display_error']);
        }

        // Check if the message starts with the prefix or sent by a bot
        if (!(message.content.startsWith(preset_prefix) || message.content.startsWith(clientMention)) || message.author.bot) {
            return;
        }

        if (!isMyClient(message.client)) return;
        if (!await check_cooldown(clientId, 'overall', config['cooldown_sec'].overall, message.client, message)) {
            return;
        }

        let args: string[] = [];
        if (message.content.startsWith(preset_prefix)) {
            args = message.content.slice(preset_prefix.length).trim().split(/ +/);
        } else if (message.content.startsWith(clientMention)) {
            args = message.content.slice(clientMention.length).trim().split(/ +/);
        } else {
            await message.reply((await get_display_error_code('C3', clientId)) ?? config['display_error']);
        }
        let commandName: string | undefined = args.shift();
        if (commandName === undefined) return;
        commandName = commandName.toLowerCase();
        if (!isMyClient(message.client)) return;
        const command: CommandModule | undefined = message.client.commands.get(commandName);    
        if (!command) {
            const [cmd_not_exist_text]: string[] = await get_display_text(['general.command_not_exist'], clientId);
            await message.reply(`${cmd_not_exist_text}${commandName}`);
            console.error(`No command matching ${commandName} was found.`);
            return;
        }

        try {
            await command.execute(message, args);
        } catch (error) {
            await message.reply((await get_display_error_code('C2', clientId))[0] ?? config['display_error']);
            console.error(error);
        }
    }
}