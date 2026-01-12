import { StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder, Message, EmbedBuilder } from 'discord.js';
import { UserSettingsInstance, USER_SETTINGS } from '../../../global/sqlite_db.js';
import { is_valid_interaction, timeout_set } from '../../../utility/timeout/timeout.js';
import { get_display_text } from '../../../utility/get_display.js';
import { ui_user_info_embed, ui_server_info_embed, user_settings_action_row } from './embed.js';
import { timeout_sec, display_error_str } from '../../../global/config.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../../utility/embed/error.js';
import { ui_timeout } from '../../../utility/timeout/embed.js';
import { InteractionModule } from '../../../global/types/module.js';
import { t_languages, isLanguages } from '../../../global/types/list_str.js';
import { selectLangStates } from '../../../global/types/interaction_states.js';
import { assertNotNull } from '../../../utility/assert.js';

const select_lang_interaction: InteractionModule<StringSelectMenuInteraction, selectLangStates> = {
    interaction_name: 'select_settings_user_lang',
    states: {
        user_settings: {
            execute: async function (interaction: StringSelectMenuInteraction): Promise<void> {
                const clientId: string = interaction.user.id;

                if (interaction.values[0] === undefined || !isLanguages(interaction.values[0])) {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                    await interaction.update({embeds: [errorEmbed], components: []});
                    return
                };
                const lang: t_languages = interaction.values[0];
                //Do sequelize thing here while get output text
                const sqlite_status: boolean = await sequelize_change_lang(interaction, lang, clientId);

                if (!sqlite_status) {
                    return;
                }

                //Success
                const userEmbed: EmbedBuilder = await ui_user_info_embed(clientId);
                const serverEmbed: EmbedBuilder = await ui_server_info_embed(clientId);
                const rowLang: ActionRowBuilder<StringSelectMenuBuilder>[] = await user_settings_action_row(clientId);
                await interaction.update({ embeds: [userEmbed, serverEmbed], components: rowLang });
                const update_msg: Message = await interaction.fetchReply();
                assertNotNull<Message>(update_msg);
                timeout_set('user_settings', update_msg.id, clientId, this.timeout_sec, this.timeout_execute, update_msg, [userEmbed, serverEmbed]);
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
        }
    },
    entry: async function(interaction: StringSelectMenuInteraction): Promise<void> {
        console.log('interaction run: select_settings_user_lang');
        const clientId: string = interaction.user.id;
        const messageId: string = interaction.message.id;

        const interaction_check: {
            valid: true
        } | {
            valid: false,
            type: 'outdated' | 'not_owner'
        } = is_valid_interaction(messageId, clientId);

        if (!interaction_check.valid) {
            if (interaction_check.type === 'outdated') {
                const [outdated_interaction_text]: string[] = await get_display_text(['general.outdated_interaction'], clientId);
                const outdated_embed: EmbedBuilder = await ui_error_non_fatal(clientId, outdated_interaction_text ?? display_error_str);
                await interaction.update({embeds: [outdated_embed], components: []});
            }
            return;
        }
        await this.states.user_settings.execute(interaction);
    }
}


async function sequelize_change_lang(interaction: StringSelectMenuInteraction, value: t_languages, clientId: string): (Promise<boolean>) {

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings: UserSettingsInstance | null = await USER_SETTINGS.findOne({ where: { clientId: clientId } });

    if (settings !== null) {
        //clientId exist, update data:
        // equivalent to: UPDATE SETTINGS (lang) values (?) WHERE clientId='?';
        const [affectedCount] = await USER_SETTINGS.update({ lang: value }, { where: { clientId: clientId } });
        if (affectedCount > 0) {
            return (true);
        }
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D3');
        await interaction.update({embeds: [errorEmbed], components: []});
        return (false);
    }
    //clientId not exist, create new data:
    try {
        // equivalent to: INSERT INTO SETTINGS (clientId, lang, hardMode) values (?, ?, ?);
        await USER_SETTINGS.create({
            clientId: clientId,
            lang: value,
        })
        return (true);
    }
    catch (error) {
        console.log(error);
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D1');
        await interaction.update({embeds: [errorEmbed], components: []});
        return (false);
    }
}

export default select_lang_interaction;