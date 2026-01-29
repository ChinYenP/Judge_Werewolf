import { is_valid_interaction, timeout_delete } from '../../../utility/timeout/timeout.js';
import { get_display_text } from '../../../utility/get_display.js';
import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { display_error_str } from '../../../global/config.js';
import { GameCreateInstance, GAME_CREATE } from '../../../global/sqlite_db.js';
import { ui_cancel } from '../../../utility/embed/cancel.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../../utility/embed/error.js';
import { InteractionModule } from '../../../global/types/module.js';
import { buttonCreateCancelStates } from '../../../global/types/interaction_states.js';

const button_cancel_interaction: InteractionModule<ButtonInteraction, buttonCreateCancelStates> = {
    interaction_name: 'button_create_cancel',
    states: {
        cancel: {
            execute: async function (interaction: ButtonInteraction): Promise<void> {
                const clientId: string = interaction.user.id;
                const messageId: string = interaction.message.id;

                if (interaction.guildId === null) {
                    await interaction.reply({ embeds: [await ui_error_fatal(clientId, 'U')], components: [] })
                    return;
                }
                const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
                if (game_create !== null) {
                    try {
                        await GAME_CREATE.destroy({ where: { clientId: clientId } });
                    } catch (error) {
                        console.error(error);
                        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
                        await interaction.reply({embeds: [errorEmbed], components: []});
                        return;
                    }
                }

                const [cancel_text]: string[] = await get_display_text(['create.cancel'], clientId);
                const cancelEmbed: EmbedBuilder = await ui_cancel(clientId, cancel_text ?? display_error_str);
                await interaction.update({ embeds: [cancelEmbed], components: []});
                timeout_delete(messageId);
            },
            timeout: false
        }
    },
    entry: async function(interaction: ButtonInteraction): Promise<void> {
        console.log('interaction run: button_create_cancel');
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

export default button_cancel_interaction;