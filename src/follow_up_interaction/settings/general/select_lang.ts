import { StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder, Message, InteractionCallbackResource, EmbedBuilder } from 'discord.js';
import { UserSettingsInstance, USER_SETTINGS } from '../../../database/sqlite_db.js';
import { interaction_is_outdated, timeout_set, is_interaction_owner } from '../../../utility/timeout.js';
import { get_display_text } from '../../../utility/get_display.js';
import { config } from '../../../text_data_config/config.js';
import { ui_user_settings } from '../../../common_ui/user_settings.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../../common_ui/error.js';

async function menu_select_lang(interaction: StringSelectMenuInteraction): Promise<void> {
    
    const clientId: string = interaction.user.id;
    const messageId: string = interaction.message.id;

    if (await interaction_is_outdated(messageId)) {
        const [outdated_interaction_text]: string[] = await get_display_text(['general.outdated_interaction'], clientId);
        const outdated_embed: EmbedBuilder = await ui_error_non_fatal(clientId, outdated_interaction_text ?? config['display_error']);
        await interaction.update({embeds: [outdated_embed], components: []});
        return;
    }
    
    if (!(await is_interaction_owner(messageId, clientId))) {
        return;
    }

    console.log('settings_general: select_lang');

    if (interaction.values[0] === undefined) return;
    if (!(['eng', 'malay', 'schi', 'tchi', 'yue'].includes(interaction.values[0]))) return;
    const lang: t_languages = interaction.values[0] as t_languages;
    //Do sequelize thing here while get output text
    const sqlite_status: boolean = await sequelize_select_lang(interaction, lang, clientId);

    if (!sqlite_status) {
        return;
    }

    //Success
    const time_sec: number = config['timeout_sec'].settings.user;
    const [rowLang, userEmbed, serverEmbed, timeoutEmbed]: [ActionRowBuilder<StringSelectMenuBuilder>, EmbedBuilder, EmbedBuilder, EmbedBuilder] = await ui_user_settings(clientId, time_sec);
    const update_msg_resource: InteractionCallbackResource = (await interaction.update({ embeds: [userEmbed, serverEmbed], components: [rowLang], withResponse: true })).resource as InteractionCallbackResource;
    const update_msg: Message = update_msg_resource.message as Message;
    await timeout_set('settings', update_msg.id, clientId, interaction.channelId, time_sec, interaction_timeout, update_msg);

    async function interaction_timeout(update_msg: Message): Promise<void> {
        await update_msg.edit({ embeds: [userEmbed, serverEmbed, timeoutEmbed], components: [] });
    }
}


async function sequelize_select_lang(interaction: StringSelectMenuInteraction, value: t_languages, clientId: string): (Promise<boolean>) {

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

export { menu_select_lang }