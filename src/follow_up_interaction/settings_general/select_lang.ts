import { StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder, Message, InteractionCallbackResource, EmbedBuilder } from 'discord.js';
import { UserSettingsInstance, USER_SETTINGS } from '../../database/sqlite_db.js';
import { interaction_is_outdated, timeout_set, is_interaction_owner } from '../../utility/timeout.js';
import { get_display_text, get_display_error_code } from '../../utility/get_display.js';
import { config } from '../../text_data_config/config.js';
import { ui_user_settings } from '../../common_ui/user_settings.js';

async function menu_select_lang(interaction: StringSelectMenuInteraction): Promise<void> {
    
    if (await interaction_is_outdated(interaction.message.id)) {
        const outdated_interaction_text: string[] = await get_display_text(['general.outdated_interaction'], interaction.user.id);
        await interaction.update({ content: outdated_interaction_text[0] ?? config['display_error'], components: [] });
        return;
    }
    
    if (!(await is_interaction_owner(interaction.message.id, interaction.user.id))) {
        return;
    }

    console.log('settings_general: select_lang');

    if (interaction.values[0] === undefined) return;
    if (!(['eng', 'malay', 'schi', 'tchi', 'yue'].includes(interaction.values[0]))) return;
    const lang: t_languages = interaction.values[0] as t_languages;
    //Do sequelize thing here while get output text
    const sqlite_status: [number, string] | [number] = await sequelize_select_lang(interaction, lang);

    if (sqlite_status[0] === 0) {
        const error_msg: string = await get_display_error_code(sqlite_status[1] ?? config['display_error'], interaction.user.id);
        await interaction.update({content: error_msg ?? config['display_error'], components: []});
        return;
    }

    //Success
    const time_sec: number = config['timeout_sec'].settings.user;
    const [rowLang, userEmbed, serverEmbed, timeoutEmbed]: [ActionRowBuilder<StringSelectMenuBuilder>, EmbedBuilder, EmbedBuilder, EmbedBuilder] = await ui_user_settings(interaction.user.id, time_sec);
    const update_msg_resource: InteractionCallbackResource = (await interaction.update({ embeds: [userEmbed, serverEmbed], components: [rowLang], withResponse: true })).resource as InteractionCallbackResource;
    const update_msg: Message = update_msg_resource.message as Message;
    await timeout_set('settings', update_msg.id, interaction.user.id, interaction.channelId, time_sec, interaction_timeout, update_msg);

    async function interaction_timeout(update_msg: Message): Promise<void> {
        await update_msg.edit({ embeds: [userEmbed, serverEmbed, timeoutEmbed], components: [] });
    }
}


async function sequelize_select_lang(interaction: StringSelectMenuInteraction, value: t_languages): (Promise<[number, string] | [number]>) {

    /*
    [1] - success.
    [0, <str>] - error encountered, next element represents error code.
    */

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings: UserSettingsInstance | null = await USER_SETTINGS.findOne({ where: { clientId: interaction.user.id } });

    if (settings !== null) {
        //clientId exist, update data:
        // equivalent to: UPDATE SETTINGS (lang) values (?) WHERE clientId='?';
        const [affectedCount] = await USER_SETTINGS.update({ lang: value }, { where: { clientId: interaction.user.id } });
        if (affectedCount > 0) {
            return [1];
        }
        return [0, 'D3'];
    }
    //clientId not exist, create new data:
    try {
        // equivalent to: INSERT INTO SETTINGS (clientId, lang, hardMode) values (?, ?, ?);
        await USER_SETTINGS.create({
            clientId: interaction.user.id,
            lang: value,
        })
        return [1];
    }
    catch (error) {
        console.log(error);
        return [0, 'D1'];
    }
}

export { menu_select_lang }