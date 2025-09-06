import { is_valid_interaction, timeout_delete } from '../../../utility/timeout/timeout.js';
import { get_display_text } from '../../../utility/get_display.js';
import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { TempPrefixSettingInstance, TEMP_PREFIX_SETTINGS } from '../../../global/sqlite_db.js';
import { ui_cancel } from '../../../utility/embed/cancel.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../../utility/embed/error.js';
import { display_error_str } from '../../../global/config.js';
import { InteractionModule } from '../../../global/types/module.js';
import { buttonPrefixNoStates } from '../../../global/types/interaction_states.js';

const button_no_interaction: InteractionModule<ButtonInteraction, buttonPrefixNoStates> = {
    interaction_name: 'button_settings_prefix_no',
    states: {
        prefix_no: {
            execute: async function (interaction: ButtonInteraction): Promise<void> {
                const clientId: string = interaction.user.id;
                const messageId: string = interaction.message.id;

                const interaction_check: {
                    valid: true
                } | {
                    valid: false,
                    type: 'outdated' | 'not_owner'
                } = await is_valid_interaction(messageId, clientId);

                if (!interaction_check.valid) {
                    if (interaction_check.type === 'outdated') {
                        const [outdated_interaction_text]: string[] = await get_display_text(['general.outdated_interaction'], clientId);
                        const outdated_embed: EmbedBuilder = await ui_error_non_fatal(clientId, outdated_interaction_text ?? display_error_str);
                        await interaction.update({embeds: [outdated_embed], components: []});
                    }
                    return;
                }

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
                const cancelEmbed: EmbedBuilder = await ui_cancel(clientId, cancel_text ?? display_error_str);
                await interaction.update({ embeds: [cancelEmbed], components: []});
                await timeout_delete(messageId);
            },
            timeout: false
        }
    },
    entry: async function(interaction: ButtonInteraction): Promise<void> {
        console.log('interaction run: button_settings_prefix_no');
        await this.states.prefix_no.execute(interaction);
    }
}

export default button_no_interaction;