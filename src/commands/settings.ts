import { Message, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { prefix_validation } from '../utility/validation/prefix_validation.js';
import { get_display_text, get_display_error_code } from '../utility/get_display.js';
import { check_cooldown } from '../utility/cooldown.js';
import { timeout_set, timeout_delete_message } from '../utility/timeout.js';
import { config } from '../text_data_config/config.js';
import { isMyClient, isTextChannel } from '../declare_type/type_guard.js';
import { TempPrefixSettingInstance, TEMP_PREFIX_SETTINGS } from '../database/sqlite_db.js';
import { ui_user_settings } from '../common_ui/user_settings.js';
import { ui_timeout } from '../common_ui/timeout.js';

export default {

    name: 'settings',
    cooldown_sec: config['cooldown_sec'].settings,
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
            await message.reply(`settings ${(await get_display_text(['general.command_args_error.less_args'], clientId))[0] ?? config['display_error']}`);
            return;
        }
        if (args.length > 2) {
            //Too much arguments;
            await message.reply(`settings ${(await get_display_text(['general.command_args_error.much_args'], clientId))[0] ?? config['display_error']}`);
            return;
        }
        //Check administrator permission
        if (args.length === 2 && !(message.member.permissionsIn(message.channel).has('Administrator'))) {
            //No permission for server settings
            await message.reply(`settings ${(await get_display_text(['general.permission_error.not_administrator'], clientId))[0] ?? config['display_error']}`);
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
                await invalid_prefix(message);
                return;
            }
            //Does not match any server settings
            await message.reply(`settings ${(await get_display_text(['general.command_args_error.wrong_args'], clientId)) ?? config['display_error']}${args[0] ?? config['display_error']}`);
            return;
        }

        //For general settings
        await general_settings(message);
        
    }

}

async function invalid_prefix(message: Message): Promise<void> {
    const [ title_text, description_text ]: string[] = await get_display_text(['settings.server_settings.prefix.invalid_prefix.title', 'settings.server_settings.prefix.invalid_prefix.description'], message.author.id);
    const invalidEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(config['embed_hex_color'])
        .setTitle(title_text ?? config['display_error'])
        .setDescription(`${description_text ?? config['display_error']}\n${process.env.ALLOWED_PREFIX_CHARACTERS}`)
    await message.reply({ embeds: [invalidEmbed] });
}


async function general_settings(message: Message): Promise<void> {

    if (!isMyClient(message.client)) return;
    await timeout_delete_message(message.author.id, 'settings', message.client);
    const time_sec: number = config['timeout_sec'].settings.user;
    const [rowLang, userEmbed, serverEmbed, timeoutEmbed]: [ActionRowBuilder<StringSelectMenuBuilder>, EmbedBuilder, EmbedBuilder, EmbedBuilder] = await ui_user_settings(message.author.id, time_sec);
    const bot_reply: Message = await message.reply({ embeds: [userEmbed, serverEmbed], components: [rowLang] });
    await timeout_set('settings', bot_reply.id, message.author.id, message.channelId, time_sec, message_timeout, bot_reply);

    async function message_timeout(bot_reply: Message): Promise<void> {
        await bot_reply.edit({ embeds: [userEmbed, serverEmbed, timeoutEmbed], components: [] });
    }
}


async function prefix_settings(message: Message, args: string[]): Promise<void> {

    if (args[1] === undefined) return;
    if (!isMyClient(message.client)) return;
    if (message.guildId === null) return;
    await timeout_delete_message(message.author.id, 'settings_prefix', message.client);
    const time_sec: number = config['timeout_sec'].settings.server.prefix;
    const [title_text, description_text, new_prefix_text, yes_text, no_text, timeout_text]: string[]
        = await get_display_text(['settings.server_settings.prefix.confirmation.title',
        'settings.server_settings.prefix.confirmation.description',
        'settings.server_settings.prefix.confirmation.new_prefix',
        'settings.server_settings.prefix.button_yes',
        'settings.server_settings.prefix.button_no',
        'settings.server_settings.prefix.timeout_text'], message.author.id);

    const new_prefix = args[1];

    const settings: TempPrefixSettingInstance | null = await TEMP_PREFIX_SETTINGS.findOne({ where: { guildId: message.guildId } });

    if (settings !== null) {
        const [affectedCount] = await TEMP_PREFIX_SETTINGS.update({ prefix: new_prefix }, { where: { guildId: message.guildId } });
        if (affectedCount <= 0) {
            await message.reply({content: (await get_display_error_code('D3', message.author.id)) ?? config['display_error'], components: []});
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
        await message.reply({content: (await get_display_error_code('D1', message.author.id)) ?? config['display_error'], components: []});
        return;
    }

    const yes_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('settings_prefix_yes')
        .setLabel(yes_text ?? config['display_error'])
        .setStyle(ButtonStyle.Success);

    const no_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('settings_prefix_no')
        .setLabel(no_text ?? config['display_error'])
        .setStyle(ButtonStyle.Secondary);
    
    const rowButton = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(yes_button, no_button);
    
    const prefixEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(config['embed_hex_color'])
        .setTitle(title_text ?? config['display_error'])
        .setDescription(description_text ?? config['display_error'])
        .addFields(
            {
                name: new_prefix_text ?? config['display_error'],
                value: new_prefix ?? config['display_error']
            }
        )
        .setTimestamp()

    const bot_reply: Message = await message.reply({ embeds: [prefixEmbed], components: [rowButton] });
    await timeout_set('prefix_settings', bot_reply.id, message.author.id, message.channelId, time_sec, message_prefix_timeout, bot_reply);

    async function message_prefix_timeout(bot_reply: Message): Promise<void> {
        if (message.guildId !== null) {
            const settings: TempPrefixSettingInstance | null = await TEMP_PREFIX_SETTINGS.findOne({ where: { guildId: message.guildId } });
            if (settings !== null) {
                try {
                    await TEMP_PREFIX_SETTINGS.destroy({ where: { guildId: message.guildId } });
                } catch (error) {
                    console.error(error);
                    await message.reply({content: (await get_display_error_code('D2', message.author.id)) ?? config['display_error'], components: []});
                    return;
                }
            }
        } else {
            console.error('message.guildId should exists.');
        }
        await bot_reply.edit({ embeds: [prefixEmbed, await ui_timeout(message.author.id, time_sec, timeout_text ?? config['display_error'])], components: [] });
    }

}