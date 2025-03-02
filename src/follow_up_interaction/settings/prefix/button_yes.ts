import { interaction_is_outdated, timeout_delete, is_interaction_owner } from '../../../utility/timeout.js';
import { get_display_text } from '../../../utility/get_display.js';
import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { config } from '../../../text_data_config/config.js';
import { ServerSettingsInstance, SERVER_SETTINGS, TempPrefixSettingInstance, TEMP_PREFIX_SETTINGS } from '../../../database/sqlite_db.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../../common_ui/error.js';
import { ui_success } from '../../../common_ui/success.js';

async function button_prefix_yes(interaction: ButtonInteraction): Promise<void> {

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
    if (interaction.guildId === null) return;

    console.log('settings_prefix: button_yes');

    //Get prefix. If it is false, the message is not from current session.
    const prefix_arr: [boolean, string] = await get_prefix(interaction.guildId);
    if (!prefix_arr[0]) {
        const [outdated_interaction_text]: string[] = await get_display_text(['general.outdated_interaction'], clientId);
        const outdated_embed: EmbedBuilder = await ui_error_non_fatal(clientId, outdated_interaction_text ?? config['display_error']);
        await interaction.update({embeds: [outdated_embed], components: []});
        return;
    }
    const prefix = prefix_arr[1];

    const sqlite_status: boolean = await sequelize_prefix_yes(interaction, prefix, clientId);
    if (!sqlite_status) {
        return;
    }

    //Success
    const [success_text]: string[] = await get_display_text(['settings.server_settings.prefix.success'], clientId);
    const successEmbed: EmbedBuilder = await ui_success(clientId, `${success_text ?? config['display_error']}${prefix}`);
    await interaction.update({ embeds: [successEmbed], components: []});
    await timeout_delete(messageId, clientId);
};

async function get_prefix(guildId: string): Promise<[boolean, string]> {
    const settings: TempPrefixSettingInstance | null = await TEMP_PREFIX_SETTINGS.findOne({where: { guildId: guildId }});
    if (settings !== null) {
        return ([true, settings.prefix]);
    }
    return ([false, '']);
}


async function sequelize_prefix_yes(interaction: ButtonInteraction, prefix: string, clientId: string): Promise<boolean> {

    if (interaction.guildId === null) {
        console.log('message.guildId should exists: ./utility/settings_prefix/button_yes.js');
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
        await interaction.update({embeds: [errorEmbed], components: []});
        return (false);
    }

    const settings_Temp: TempPrefixSettingInstance | null = await TEMP_PREFIX_SETTINGS.findOne({ where: { guildId: interaction.guildId } });
    if (settings_Temp !== null) {
        try {
            await TEMP_PREFIX_SETTINGS.destroy({ where: { guildId: interaction.guildId } });
        } catch (error) {
            console.error(error);
            const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
            await interaction.update({embeds: [errorEmbed], components: []});
        }
    }

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings: ServerSettingsInstance | null = await SERVER_SETTINGS.findOne({ where: { guildId: interaction.guildId } });

    if (settings !== null) {
        //guildId exist, update data:
        // equivalent to: UPDATE SETTINGS (lang) values (?) WHERE clientId='?';
        const [affectedCount] = await SERVER_SETTINGS.update({ prefix: prefix }, { where: { guildId: interaction.guildId } });
        if (affectedCount > 0) {
            return (true);
        };
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D3');
        await interaction.update({embeds: [errorEmbed], components: []});
        return (false);
    };
    //clientId not exist, create new data:
    try {
        // equivalent to: INSERT INTO SETTINGS (clientId, lang, hardMode) values (?, ?, ?);
        await SERVER_SETTINGS.create({
            guildId: interaction.guildId,
            prefix: prefix,
        })
        return (true);
    }
    catch (error) {
        console.log(error);
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D1');
        await interaction.update({embeds: [errorEmbed], components: []});
        return (false);
    };
};

export { button_prefix_yes }