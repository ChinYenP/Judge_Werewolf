import { ButtonInteraction, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, Message, EmbedBuilder } from 'discord.js';
import { is_valid_interaction, timeout_set } from '../../../../utility/timeout/timeout.js';
import { get_display_text } from '../../../../utility/get_display.js';
import { display_error_str, timeout_sec } from '../../../../global/config.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../../../utility/embed/error.js';
import { InteractionModule } from '../../../../global/types/module.js';
import { buttonCreateRolesNext } from '../../../../global/types/interaction_states.js';
import { t_error_code } from '../../../../global/types/list_str.js';
import { common_delete_create_timeout } from '../../common_process/delete_create_timeout.js';
import { GAME_CREATE, GameCreateInstance } from '../../../../global/sqlite_db.js';
import { roles_common_process } from '../../common_process/roles.js';
import { final_common_process } from '../../common_process/final.js';
import { win_condition_in_role } from '../../../gameplay/game_logic/win_condition.js';

const button_roles_next_interaction: InteractionModule<ButtonInteraction, buttonCreateRolesNext> = {
    interaction_name: 'button_create_initial_next',
    states: {
        roles: {
            execute: async function (interaction: ButtonInteraction): Promise<void> {
                const clientId: string = interaction.user.id;

                //Roles process
                const roles_process_obj: {
                    error: false,
                    value: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
                        | [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
                } | {
                    error: true,
                    code: t_error_code
                } = await roles_common_process(clientId, {action: 'none'});
                if (roles_process_obj.error) {
                    await interaction.reply({ embeds: [await ui_error_fatal(clientId, roles_process_obj.code)], components: [] })
                    return;
                }

                //Success
                const [ActionRowArr, rolesEmbed]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
                        | [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
                    = roles_process_obj.value;
                await interaction.update({ embeds: [rolesEmbed], components: ActionRowArr })
                const update_msg: Message = await interaction.fetchReply();
                timeout_set('create', update_msg.id, clientId, this.timeout_sec, this.timeout_execute, update_msg, rolesEmbed);
            },
            timeout: true,
            timeout_sec: timeout_sec.create,
            timeout_execute: async function(reply_msg: Message, clientId: string, timeout_sec: number, rolesEmbed: EmbedBuilder): Promise<void> {
                const timeoutObj: {embed: EmbedBuilder, error: boolean} = await common_delete_create_timeout(clientId, timeout_sec);
                if (timeoutObj.error) {
                    await reply_msg.edit({embeds: [timeoutObj.embed], components: []});
                    return;
                }
                await reply_msg.edit({ embeds: [rolesEmbed, timeoutObj.embed], components: [] });
            }
        },
        final: {
            execute: async function (interaction: ButtonInteraction): Promise<void> {
                const clientId: string = interaction.user.id;

                //Final process
                const final_process_obj: {
                    error: false,
                    value: [[ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
                } | {
                    error: true,
                    code: t_error_code
                } = await final_common_process(clientId);
                if (final_process_obj.error) {
                    await interaction.reply({ embeds: [await ui_error_fatal(clientId, final_process_obj.code)], components: [] })
                    return;
                }

                //Success
                const [ActionRowArr, rolesEmbed]: [[ActionRowBuilder<ButtonBuilder>], EmbedBuilder] = final_process_obj.value;
                await interaction.update({ embeds: [rolesEmbed], components: ActionRowArr })
                const update_msg: Message = await interaction.fetchReply();
                timeout_set('create', update_msg.id, clientId, this.timeout_sec, this.timeout_execute, update_msg, rolesEmbed);
            },
            timeout: true,
            timeout_sec: timeout_sec.create,
            timeout_execute: async function(reply_msg: Message, clientId: string, timeout_sec: number, finalEmbed: EmbedBuilder): Promise<void> {
                const timeoutObj: {embed: EmbedBuilder, error: boolean} = await common_delete_create_timeout(clientId, timeout_sec);
                if (timeoutObj.error) {
                    await reply_msg.edit({embeds: [timeoutObj.embed], components: []});
                    return;
                }
                await reply_msg.edit({ embeds: [finalEmbed, timeoutObj.embed], components: [] });
            }
        }
    },
    entry: async function(interaction: ButtonInteraction): Promise<void> {
        console.log('interaction run: button_create_roles_next');
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

        const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
        if (game_create === null || game_create.is_preset === null || game_create.num_players === null || game_create.game_rule === null
            || game_create.sheriff === null || game_create.players_role === null) {
            await interaction.reply({ embeds: [await ui_error_fatal(clientId, 'U')], components: [] })
            return;
        }
        if (game_create.players_role.length !== game_create.num_players || win_condition_in_role(game_create.players_role, game_create.game_rule) !== 'unknown') {
            console.warn('create_roles_button_next: existing length is not same as set max players OR win condition of roles not met, should not be able to reach here.');
            await this.states.roles.execute(interaction);
            return;
        }
        await this.states.final.execute(interaction);
    }
}

export default button_roles_next_interaction;