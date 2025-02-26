import { interaction_is_outdated, timeout_delete, is_interaction_owner } from '../../utility/timeout.js';
import { get_display_text } from '../../utility/get_display.js';
import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { config } from '../../text_data_config/config.js';
import { TempPrefixSettingInstance, TEMP_PREFIX_SETTINGS } from '../../database/sqlite_db.js';
import { ui_cancel } from '../../common_ui/cancel.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../common_ui/error.js';

async function button_prefix_no(interaction: ButtonInteraction): Promise<void> {

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

    console.log('settings_prefix: button_no');

    if (interaction.guildId === null) return;
    const settings: TempPrefixSettingInstance | null = await TEMP_PREFIX_SETTINGS.findOne({ where: { guildId: interaction.guildId } });
    if (settings !== null) {
        try {
            await TEMP_PREFIX_SETTINGS.destroy({ where: { guildId: interaction.guildId } });
        } catch (error) {
            console.error(error);
            const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
            await interaction.update({embeds: [errorEmbed], components: []});
            return;
        }
    }

    const [cancel_text]: string[] = await get_display_text(['settings.server_settings.prefix.cancellation'], clientId);
    const cancelEmbed: EmbedBuilder = await ui_cancel(clientId, cancel_text ?? config['display_error']);
    await interaction.update({ embeds: [cancelEmbed], components: []});
    await timeout_delete(messageId, clientId);
}

export { button_prefix_no }