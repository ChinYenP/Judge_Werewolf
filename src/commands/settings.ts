import { Message, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prefix_validation } from '../utility/validation/prefix_validation.js';
import { get_display_text, get_display_error_code } from '../utility/get_display.js';
import { check_cooldown } from '../utility/cooldown.js';
import { general_timeout_set, general_delete_message } from '../utility/timeout.js';
import { config } from '../text_data_config/config.js';
import { isMyClient, isTextChannel } from '../declare_type/type_guard.js';
import { TempPrefixSettingInstance, TEMP_PREFIX_SETTINGS } from '../database/sqlite_db.js';
import { ui_user_settings } from '../common_ui/user_settings.js';

export default {

    name: 'settings',
    cooldown_sec: config['cooldown_sec'].settings,
    timeout: true,
    timeout_sec: config['timeout_sec'].settings,
    async execute(message: Message, args: string[]): Promise<void> {
        console.log(`Settings command ran, args: ${args.join(", ")}`);

        const clientId: string = message.author.id;
        if (!isMyClient(message.client)) return;
        if (!await check_cooldown(clientId, this.name, this.cooldown_sec, message.client, message)) {
            return;
        }
        if (message.member === null || !isTextChannel(message.channel)) return;

        //Check arguments
        if (args.length === 1) {
            //Too less arguments
            const less_args_text: string[] = await get_display_text(['general.command_args_error.less_args'], message.author.id);
            if (less_args_text.length !== 1) {
                console.error('DSPY error at ./commands/settings.js, no6');
                await message.reply(config['display_error']);
                return;
            }
            await message.reply(`settings${less_args_text[0] ?? config['display_error']}`);
            return;
        }
        if (args.length > 2) {
            //Too much arguments
            const much_args_text: string[] = await get_display_text(['general.command_args_error.much_args'], message.author.id);
            if (much_args_text.length !== 1) {
                console.error('DSPY error at ./commands/settings.js, no7');
                await message.reply(config['display_error']);
                return;
            }
            await message.reply(`settings${much_args_text[0] ?? config['display_error']}`);
            return;
        }
        //Check administrator permission
        if (args.length === 2 && !(message.member.permissionsIn(message.channel).has('Administrator'))) {
            //No permission for server settings
            const not_administrator_text: string[] = await get_display_text(['general.permission_error.not_administrator'], message.author.id);
            if (not_administrator_text.length !== 1) {
                console.error('DSPY error at ./commands/settings.js, no8');
                await message.reply(config['display_error']);
                return;
            }
            await message.reply(`settings${not_administrator_text[0] ?? config['display_error']}`);
            return;
        }

        //Specific settings
        if (args.length === 2 && message.member.permissionsIn(message.channel).has('Administrator')) {
            if (args[0] === 'prefix') {
                if (args[1] === undefined) return;
                if (await prefix_validation(args[1])) {
                    //Valid argument for prefix
                    await prefix_settings(message, args);
                    return;
                }
                //Invalid argument for prefix
                const invalid_prefix_text: string[] = await get_display_text(['settings.server_settings.prefix.invalid_prefix'], message.author.id);
                if (invalid_prefix_text.length !== 1) {
                    console.error('DSPY error at ./commands/settings.js, no9');
                    await message.reply(config['display_error']);
                    return;
                }
                const allow_characters: string = process.env.ALLOWED_PREFIX_CHARACTERS;
                await message.reply((invalid_prefix_text[0] ?? config['display_error']) + allow_characters);
                return;
            }
            //Does not match any server settings
            const args_error_text: string[] = await get_display_text(['general.command_args_error.wrong_args'], message.author.id);
            if (args_error_text.length !== 1) {
                console.error('DSPY error at ./commands/settings.js, no10');
                await message.reply(config['display_error']);
                return;
            }
            await message.reply(`settings${args_error_text[0] ?? config['display_error']}${args[0] ?? config['display_error']}`);
            return;
        }

        //For general settings
        await general_settings(message);
        
    },

};


async function general_settings(message: Message): Promise<void> {

    if (!isMyClient(message.client)) return;
    await general_delete_message(message.author.id, 'settings', message.client);
    const time_sec: number = config['timeout_sec'].settings.user;
    const [rowLang, Content, timeout_content]: [ActionRowBuilder<StringSelectMenuBuilder>, string, string] = await ui_user_settings(message.author.id, time_sec);
    const bot_reply: Message = await message.reply({ content: Content, components: [rowLang] });
    await general_timeout_set('settings', bot_reply.id, message.author.id, message.channelId, time_sec, message_timeout, bot_reply);

    async function message_timeout(bot_reply: Message): Promise<void> {
        await bot_reply.edit({ content: timeout_content, components: [] });
    }

}


async function prefix_settings(message: Message, args: string[]): Promise<void> {

    if (args[1] === undefined) return;
    if (!isMyClient(message.client)) return;
    if (message.guildId === null) return;
    await general_delete_message(message.author.id, 'settings_prefix', message.client);
    const time_sec: number = config['timeout_sec'].settings.server.prefix;
    const display_arr: string[] = await get_display_text(['settings.server_settings.prefix.confirmation',
        'settings.server_settings.prefix.button_yes',
        'settings.server_settings.prefix.button_no',
        'settings.server_settings.prefix.timeout_text'], message.author.id);
    if (display_arr.length !== 4) {
        console.error('DSPY error at ./commands/ping.js, no12');
        await message.reply(config['display_error']);
        return;
    }

    const new_prefix = args[1];

    const settings: TempPrefixSettingInstance | null = await TEMP_PREFIX_SETTINGS.findOne({ where: { guildId: message.guildId } });

    if (settings !== null) {
        const [affectedCount] = await TEMP_PREFIX_SETTINGS.update({ prefix: new_prefix }, { where: { guildId: message.guildId } });
        if (affectedCount <= 0) {
            const display_arr: string[] = await get_display_error_code('D3', message.author.id);
            if (display_arr.length !== 1) {
                console.error('DSPY error at ./commands/settings.js, no13');
                await message.reply({content: config['display_error'], components: []});
                return;
            }
            console.error(`D3 error at ./commands/settings.js, no14`);
            await message.reply({content: display_arr[0] ?? config['display_error'], components: []});
            return;
        }
    }
    //clientId not exist, create new data:
    try {
        await TEMP_PREFIX_SETTINGS.create({
            guildId: message.guildId,
            prefix: new_prefix,
        })
    }
    catch (error) {
        console.log(error);
        const display_arr: string[] = await get_display_error_code('D1', message.author.id);
        if (display_arr.length !== 1) {
            console.error('DSPY error at ./commands/settings.js, no15');
            await message.reply({content: config['display_error'], components: []});
            return;
        }
        console.error(`D3 error at ./commands/settings.js, no16`);
        await message.reply({content: display_arr[0] ?? config['display_error'], components: []});
        return;
    }

    const yes_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('settings_prefix_yes')
        .setLabel(display_arr[1] ?? config['display_error'])
        .setStyle(ButtonStyle.Success);

    const no_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('settings_prefix_no')
        .setLabel(display_arr[2] ?? config['display_error'])
        .setStyle(ButtonStyle.Secondary);
    
    const rowButton = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(yes_button, no_button);
    
    const bot_reply: Message = await message.reply({ content: (display_arr[0] ?? config['display_error']) + new_prefix, components: [rowButton] });
    await general_timeout_set(bot_reply.id, message.author.id, message.channelId, message.guildId, time_sec, message_prefix_timeout, bot_reply);

    async function message_prefix_timeout(bot_reply: Message): Promise<void> {
        if (message.guildId !== null) {
            const settings: TempPrefixSettingInstance | null = await TEMP_PREFIX_SETTINGS.findOne({ where: { guildId: message.guildId } });
            if (settings !== null) {
                try {
                    await TEMP_PREFIX_SETTINGS.destroy({ where: { guildId: message.guildId } });
                } catch (error) {
                    console.error(error);
                    const display_arr: string[] = await get_display_error_code('D2', message.author.id);
                    if (display_arr.length !== 1) {
                        console.error('DSPY error at ./commands/settings.js, no17');
                        await message.reply({content: config['display_error'], components: []});
                        return;
                    }
                    console.error(`D3 error at ./commands/settings.js, no18`);
                    await message.reply({content: display_arr[0] ?? config['display_error'], components: []});
                    return;
                }
            }
        } else {
            console.log('message.guildId should exists: ./commands/settings.js');
        }
        const timeout_content: string = `${(display_arr[0] ?? config['display_error']) + (args[1] ?? config['display_error'])}\n\n${(display_arr[3] ?? config['display_error']) + time_sec.toString()}s`;
        await bot_reply.edit({ content: timeout_content, components: [] });
    }

}