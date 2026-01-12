import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js';
import { prefix_validation } from '../../utility/validation/prefix_validation.js';
import { get_display_text } from '../../utility/get_display.js';
import { check_cooldown } from '../../utility/cooldown/check_cooldown.js';
import { ui_cooldown } from '../../utility/cooldown/embed.js';
import { timeout_set, delete_message } from '../../utility/timeout/timeout.js';
import { command_cooldown_sec, embed_hex_color, display_error_str, timeout_sec } from '../../global/config.js';
import { isTextChannel, t_cooldown_status } from '../../global/types/other_types.js';
import { settingsStates } from '../../global/types/command_states.js';
import { CommandModule } from '../../global/types/module.js';
import { t_interaction_name } from '../../global/types/list_str.js';
import { TempPrefixSettingInstance, TEMP_PREFIX_SETTINGS } from '../../global/sqlite_db.js';
import { ui_server_info_embed, ui_user_info_embed, user_settings_action_row } from './user/embed.js';
import { ui_timeout } from '../../utility/timeout/embed.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../utility/embed/error.js';

const settings_command: CommandModule<settingsStates> = {
    command: 'settings',
    states: {
        user_settings: {
            cooldown_sec: command_cooldown_sec.user_settings,
            execute: async function (message: Message, _args: string[]): Promise<void> {
                const clientId: string = message.author.id;
                const cooldown_status: t_cooldown_status = await check_cooldown(clientId, 'user_settings', this.cooldown_sec);
                if (cooldown_status.status == 'cooldown') {
                    await message.reply({ embeds: [await ui_cooldown(clientId, cooldown_status.remaining_sec)], components: [] })
                    return;
                } else if (cooldown_status.status == 'fatal') {
                    await message.reply({ embeds: [await ui_error_fatal(clientId, cooldown_status.error_code)], components: [] })
                    return;
                }
                await delete_message(clientId, 'user_settings');
                const userEmbed: EmbedBuilder = await ui_user_info_embed(clientId);
                const serverEmbed: EmbedBuilder = await ui_server_info_embed(clientId);
                const rowLang: ActionRowBuilder<StringSelectMenuBuilder>[] = await user_settings_action_row(clientId);
                const bot_reply: Message = await message.reply({ embeds: [userEmbed, serverEmbed], components: rowLang });
                timeout_set('user_settings', bot_reply.id, clientId, this.timeout_sec, this.timeout_execute, bot_reply, [userEmbed, serverEmbed]);
            },
            timeout: true,
            timeout_sec: timeout_sec.user_settings,
            timeout_execute: async function(reply_msg: Message, clientId: string, timeout_sec: number, data_passed: [EmbedBuilder, EmbedBuilder]): Promise<void> {
                const userEmbed: EmbedBuilder = data_passed[0];
                const serverEmbed: EmbedBuilder = data_passed[1];
                const [timeout_text]: string[] = await get_display_text(['settings.embed.timeout_text'], clientId);
                const timeoutEmbed: EmbedBuilder = await ui_timeout(clientId, timeout_sec, timeout_text ?? display_error_str);
                await reply_msg.edit({ embeds: [userEmbed, serverEmbed, timeoutEmbed], components: [] });
            }
        },
        prefix_confirmation: {
            cooldown_sec: command_cooldown_sec.settings_prefix,
            execute: async function (message: Message, args: string[]): Promise<void> {
                const clientId: string = message.author.id;
                if (args[1] === undefined) return;
                if (message.guildId === null) return;
                await delete_message(clientId, 'settings_prefix');
                const time_sec: number = timeout_sec.settings_prefix;
                const [title_text, description_text, new_prefix_text, yes_text, no_text]: string[]
                    = await get_display_text(['settings.server_settings.prefix.confirmation.title',
                    'settings.server_settings.prefix.confirmation.description',
                    'settings.server_settings.prefix.confirmation.new_prefix',
                    'settings.server_settings.prefix.button_yes',
                    'settings.server_settings.prefix.button_no'], clientId);

                const new_prefix: string = args[1];

                const settings: TempPrefixSettingInstance | null = await TEMP_PREFIX_SETTINGS.findOne({ where: { guildId: message.guildId } });

                if (settings !== null) {
                    const [affectedCount] = await TEMP_PREFIX_SETTINGS.update({ prefix: new_prefix }, { where: { guildId: message.guildId } });
                    if (affectedCount <= 0) {
                        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D3');
                        await message.reply({embeds: [errorEmbed], components: []});
                        return;
                    }
                } else {
                    //clientId not exist, create new data:
                    try {
                        await TEMP_PREFIX_SETTINGS.create({
                            guildId: message.guildId,
                            prefix: new_prefix,
                        })
                    }
                    catch (error) {
                        console.log(error);
                        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D1');
                        await message.reply({embeds: [errorEmbed], components: []});
                        return;
                    }
                }

                const yes_button: ButtonBuilder = new ButtonBuilder()
                    .setCustomId('button_settings_prefix_yes' satisfies t_interaction_name)
                    .setLabel(yes_text ?? display_error_str)
                    .setStyle(ButtonStyle.Success);

                const no_button: ButtonBuilder = new ButtonBuilder()
                    .setCustomId('button_settings_prefix_no' satisfies t_interaction_name)
                    .setLabel(no_text ?? display_error_str)
                    .setStyle(ButtonStyle.Secondary);
                
                const rowButton: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(yes_button, no_button);
                
                const prefixEmbed: EmbedBuilder = new EmbedBuilder()
                    .setColor(embed_hex_color)
                    .setTitle(title_text ?? display_error_str)
                    .setDescription(description_text ?? display_error_str)
                    .addFields(
                        {
                            name: new_prefix_text ?? display_error_str,
                            value: new_prefix
                        }
                    )
                    .setTimestamp()

                const bot_reply: Message = await message.reply({ embeds: [prefixEmbed], components: [rowButton] });
                timeout_set('settings_prefix', bot_reply.id, clientId, time_sec, this.timeout_execute, bot_reply, prefixEmbed);

            },
            timeout: true,
            timeout_sec: timeout_sec.settings_prefix,
            timeout_execute: async function(reply_msg: Message, clientId: string, timeout_sec: number, prefixEmbed: EmbedBuilder): Promise<void> {
                if (reply_msg.guildId !== null) {
                    const settings: TempPrefixSettingInstance | null = await TEMP_PREFIX_SETTINGS.findOne({ where: { guildId: reply_msg.guildId } });
                    if (settings !== null) {
                        try {
                            await TEMP_PREFIX_SETTINGS.destroy({ where: { guildId: reply_msg.guildId } });
                        } catch (error) {
                            console.error(error);
                            const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
                            await reply_msg.reply({embeds: [errorEmbed], components: []});
                            return;
                        }
                    }
                } else {
                    console.error('message.guildId should exists.');
                }
                const [timeout_text]: string[] = await get_display_text(['settings.server_settings.prefix.timeout_text'], clientId);
                await reply_msg.edit({ embeds: [prefixEmbed, await ui_timeout(clientId, timeout_sec, timeout_text ?? display_error_str)], components: [] });
            }
        }
    },
    entry: async function(message: Message, args: string[]): Promise<void> {
        console.log(`Settings command ran, args: ${args.join(", ")}`);
        const clientId: string = message.author.id;

        if (message.member === null || !isTextChannel(message.channel)) return;

        //Check arguments
        if (args.length === 1) {
            //Too less arguments
            const [less_args_text]: string[] = await get_display_text(['general.command_args_error.less_args'], clientId);
            const less_args_embed: EmbedBuilder = await ui_error_non_fatal(clientId, `settings ${less_args_text ?? display_error_str}`);
            await message.reply({embeds: [less_args_embed], components: []});
            return;
        }
        if (args.length > 2) {
            //Too much arguments;
            const [much_args_text]: string[] = await get_display_text(['general.command_args_error.much_args'], clientId);
            const much_args_embed: EmbedBuilder = await ui_error_non_fatal(clientId, `settings ${much_args_text ?? display_error_str}`);
            await message.reply({embeds: [much_args_embed], components: []});
            return;
        }
        //Check administrator permission
        if (args.length === 2 && !(message.member.permissionsIn(message.channel).has('Administrator'))) {
            //No permission for server settings
            const [no_perm_text]: string[] = await get_display_text(['general.permission_error.not_administrator'], clientId);
            const no_perm_embed: EmbedBuilder = await ui_error_non_fatal(clientId, no_perm_text ?? display_error_str);
            await message.reply({embeds: [no_perm_embed], components: []});
            return;
        }

        //Specific settings
        if (args.length === 2 && message.member.permissionsIn(message.channel).has('Administrator')) {
            if (args[0] === undefined) return;
            if (args[0] === 'prefix') {
                if (args[1] === undefined) return;
                if (prefix_validation(args[1])) {
                    //Valid argument for prefix
                    await (this.states.prefix_confirmation).execute(message, args);
                    return;
                }
                //Invalid argument for prefix
                const [ title_text, description_text ]: string[] = await get_display_text(['settings.server_settings.prefix.invalid_prefix.title', 'settings.server_settings.prefix.invalid_prefix.description'], clientId);
                const invalidEmbed: EmbedBuilder = new EmbedBuilder()
                    .setColor(embed_hex_color)
                    .setTitle(title_text ?? display_error_str)
                    .setDescription(`${description_text ?? display_error_str}\n\`\`\`${process.env.ALLOWED_PREFIX_CHARACTERS}\`\`\``)
                await message.reply({ embeds: [invalidEmbed], components: [] });
                return;
            }
            //Does not match any server settings
            const [wrong_args_text]: string[] = await get_display_text(['general.command_args_error.wrong_args'], clientId);
            const wrong_args_embed: EmbedBuilder = await ui_error_non_fatal(clientId, `settings ${wrong_args_text ?? display_error_str}${args[0]}`);
            await message.reply({embeds: [wrong_args_embed], components: []});
            return;
        }

        //For general settings
        await this.states.user_settings.execute(message, args);
    }
}

export default settings_command;