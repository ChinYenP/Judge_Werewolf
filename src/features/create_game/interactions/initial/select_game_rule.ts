import { StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, Message, EmbedBuilder } from 'discord.js';
import { is_valid_interaction, timeout_set } from '../../../../utility/timeout/timeout.js';
import { get_display_text } from '../../../../utility/get_display.js';
import { display_error_str, timeout_sec } from '../../../../global/config.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../../../utility/embed/error.js';
import { InteractionModule } from '../../../../global/types/module.js';
import { selectCreateGameRule } from '../../../../global/types/interaction_states.js';
import { t_error_code, isGameRule } from '../../../../global/types/list_str.js';
import { initial_common_process } from '../../common_process/initial.js';
import { common_delete_create_timeout } from '../../common_process/delete_create_timeout.js';

const select_game_rule_interaction: InteractionModule<StringSelectMenuInteraction, selectCreateGameRule> = {
    interaction_name: 'select_create_initial_game_rule',
    states: {
        initial: {
            execute: async function (interaction: StringSelectMenuInteraction): Promise<void> {
                const clientId: string = interaction.user.id;

                if (interaction.values[0] === undefined || !isGameRule(interaction.values[0])) {
                    await interaction.reply({ embeds: [await ui_error_fatal(clientId, 'U')], components: [] })
                    return;
                }

                //Initial process
                const initial_process_obj: {
                    error: false,
                    value: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>,
                    ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
                } | {
                    error: true,
                    code: t_error_code
                } = await initial_common_process(clientId, {replace: 'game_rule', value: interaction.values[0]});
                if (initial_process_obj.error) {
                    await interaction.reply({ embeds: [await ui_error_fatal(clientId, initial_process_obj.code)], components: [] })
                    return;
                }

                //Success
                const [ActionRowArr, initialEmbed]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>,
                    ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
                    = initial_process_obj.value;
                await interaction.update({ embeds: [initialEmbed], components: ActionRowArr });
                const update_msg: Message = await interaction.fetchReply();
                timeout_set('create', update_msg.id, clientId, this.timeout_sec, this.timeout_execute, update_msg, initialEmbed);
            },
            timeout: true,
            timeout_sec: timeout_sec.create,
            timeout_execute: async function(reply_msg: Message, clientId: string, timeout_sec: number, initialEmbed: EmbedBuilder): Promise<void> {
                const timeoutObj: {embed: EmbedBuilder, error: boolean} = await common_delete_create_timeout(clientId, timeout_sec);
                if (timeoutObj.error) {
                    await reply_msg.edit({embeds: [timeoutObj.embed], components: []});
                    return;
                }
                await reply_msg.edit({ embeds: [initialEmbed, timeoutObj.embed], components: [] });
            }
        }
    },
    entry: async function(interaction: StringSelectMenuInteraction): Promise<void> {
        console.log('interaction run: select_create_initial_game_rule');
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
        await this.states.initial.execute(interaction);
    }
}

export default select_game_rule_interaction;