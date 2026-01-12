import { Message, Events } from 'discord.js';
import { check_cooldown } from '../utility/cooldown/check_cooldown.js';
import { ui_cooldown } from '../utility/cooldown/embed.js';
import { prefix_validation } from '../utility/validation/prefix_validation.js';
import { get_display_text, get_display_error_code } from '../utility/get_display.js';
import { default_prefix, display_error_str, command_cooldown_sec } from '../global/config.js';
import { EventModule } from '../global/types/module.js';
import { t_commands, isCommand } from '../global/types/list_str.js';
import { t_cooldown_status } from '../global/types/other_types.js';
import { AllCommandModules } from '../global/types/command_states.js';
import { ServerSettingsInstance, SERVER_SETTINGS } from '../global/sqlite_db.js';
import { ui_error_fatal } from '../utility/embed/error.js';

async function get_command_module(command: t_commands): Promise<AllCommandModules | undefined> {
    switch (command) {
        case ('help'):
            return ((await import('../general_commands/help.js')).default);
        case ('ping'):
            return ((await import('../general_commands/ping.js')).default);
        case ('game_id'):
            return ((await import('../general_commands/game_id.js')).default);
        case ('prefix'):
            return ((await import('../general_commands/prefix.js')).default);
        case ('settings'):
            return ((await import('../features/settings/settings.js')).default);
        case ('create'):
            return ((await import('../features/create_game/create.js')).default);
        default:
            return (undefined);
    }
}

const message_create: EventModule<Message> = {
    event_name: Events.MessageCreate,
    once: false,
    async execute(message: Message): Promise<void> {

        const clientId: string = message.author.id;

        let preset_prefix: string = '';
        const clientMention: string = message.client.user.toString();

        if (message.guildId === null) return;
        const settings: ServerSettingsInstance | null = await SERVER_SETTINGS.findOne({ where: { guildId: message.guildId } });
        if (settings !== null) {
            //guildId exist
            preset_prefix = settings.prefix;
        } else {
            //guildId not exist
            preset_prefix = default_prefix;
        }
        //Validate prefix
        if (!prefix_validation(preset_prefix)) {
            await message.reply((await get_display_error_code('C3', clientId)));
        }

        // Check if the message starts with the prefix or sent by a bot
        if (!(message.content.startsWith(preset_prefix) || message.content.startsWith(clientMention)) || message.author.bot) {
            return;
        }

        const cooldown_status: t_cooldown_status = await check_cooldown(clientId, 'overall', command_cooldown_sec.overall);
        if (cooldown_status.status == 'cooldown') {
            await message.reply({ embeds: [await ui_cooldown(clientId, cooldown_status.remaining_sec)], components: [] })
            return;
        } else if (cooldown_status.status == 'fatal') {
            await message.reply({ embeds: [await ui_error_fatal(clientId, cooldown_status.error_code)], components: [] })
            return;
        }

        let args: string[] = [];
        if (message.content.startsWith(preset_prefix)) {
            args = message.content.slice(preset_prefix.length).trim().split(/ +/);
        } else if (message.content.startsWith(clientMention)) {
            args = message.content.slice(clientMention.length).trim().split(/ +/);
        } else {
            await message.reply((await get_display_error_code('C3', clientId)));
        }
        let commandName: string | undefined = args.shift();
        if (commandName === undefined) return;
        commandName = commandName.toLowerCase();
        if (!isCommand(commandName)) {
            const [cmd_not_exist_text]: string[] = await get_display_text(['general.command_not_exist'], clientId);
            await message.reply(`${cmd_not_exist_text ?? display_error_str}${commandName}`);
            console.error(`No command matching ${commandName} was found.`);
            return;
        }
        const command: AllCommandModules | undefined = await get_command_module(commandName);
        if (!command) {
            const [cmd_not_exist_text]: string[] = await get_display_text(['general.command_not_implemented'], clientId);
            await message.reply(`${cmd_not_exist_text ?? display_error_str}${commandName}`);
            console.error(`Command matching ${commandName} is not implemented yet.`);
            return;
        }

        try {
            await command.entry(message, args);
        } catch (error) {
            await message.reply((await get_display_error_code('C2', clientId))[0] ?? display_error_str);
            console.error(error);
        }
    }
}

export default message_create;