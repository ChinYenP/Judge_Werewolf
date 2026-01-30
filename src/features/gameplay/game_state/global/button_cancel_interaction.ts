import { is_valid_interaction, timeout_delete } from '../../../../utility/timeout/timeout.js';
import { get_display_text } from '../../../../utility/get_display.js';
import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { display_error_str } from '../../../../global/config.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../../../utility/embed/error.js';
import { InteractionModule } from '../../../../global/types/module.js';
import { buttonGameplayCancel } from '../../../../global/types/interaction_states.js';
import { t_error_code } from '../../../../global/types/list_str.js';
import { game_result } from './result.js';

const button_game_cancel_interaction: InteractionModule<ButtonInteraction, buttonGameplayCancel> = {
    interaction_name: 'button_gameplay_cancel',
    states: {
        cancel: {
            execute: async function (interaction: ButtonInteraction): Promise<void> {
                const clientId: string = interaction.user.id;

                const gameUIObj: {error: true, code: t_error_code} |
                    {error: false, end: true, prevStateEmbed: EmbedBuilder | null, resultEmbed: EmbedBuilder}
                    = await game_result(clientId, 'timeout', null);
                if (gameUIObj.error) {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, gameUIObj.code);
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }
                await interaction.update({ embeds: [gameUIObj.resultEmbed], components: [] });
                timeout_delete(clientId, 'gameplay');
            },
            timeout: false
        }
    },
    entry: async function(interaction: ButtonInteraction): Promise<void> {
        console.log('interaction run: button_gameplay_cancel');
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
        await this.states.cancel.execute(interaction);
    }
}

export default button_game_cancel_interaction;