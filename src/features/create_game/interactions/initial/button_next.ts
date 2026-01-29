import { ButtonInteraction, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, Message, EmbedBuilder } from 'discord.js';
import { is_valid_interaction, timeout_set } from '../../../../utility/timeout/timeout.js';
import { get_display_text } from '../../../../utility/get_display.js';
import { display_error_str, timeout_sec } from '../../../../global/config.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../../../utility/embed/error.js';
import { InteractionModule } from '../../../../global/types/module.js';
import { buttonCreateInitialNext} from '../../../../global/types/interaction_states.js';
import { t_error_code } from '../../../../global/types/list_str.js';
import { initial_common_process } from '../../common_process/initial.js';
import { common_delete_create_timeout } from '../../common_process/delete_create_timeout.js';
import { GAME_CREATE, GameCreateInstance } from '../../../../global/sqlite_db.js';
import { roles_common_process } from '../../common_process/roles.js';

const button_initial_next_interaction: InteractionModule<ButtonInteraction, buttonCreateInitialNext> = {
    interaction_name: 'button_create_initial_next',
    states: {
        initial: {
            execute: async function (interaction: ButtonInteraction): Promise<void> {
                const clientId: string = interaction.user.id;

                //Initial process
                const initial_process_obj: {
                    error: false,
                    value: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>,
                    ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
                } | {
                    error: true,
                    code: t_error_code
                } = await initial_common_process(clientId, {replace: 'none'});
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
        },
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
                } = await roles_common_process(clientId, {action: 'just_next'});
                if (roles_process_obj.error) {
                    console.log(roles_process_obj.error)
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
        }
    },
    entry: async function(interaction: ButtonInteraction): Promise<void> {
        console.log('interaction run: button_create_initial_next');
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
        if (game_create === null || game_create.is_preset === null || game_create.num_players === null || game_create.game_rule === null) {
            console.warn('create_initial_button_next: game_create or its properties is null, should not be able to reach here.');
            await this.states.initial.execute(interaction);
            return;
        };
        await this.states.roles.execute(interaction);
    }
}

export default button_initial_next_interaction;