import { StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, Message, EmbedBuilder } from 'discord.js';
import { is_valid_interaction, timeout_set } from '../../../../utility/timeout/timeout.js';
import { get_display_text } from '../../../../utility/get_display.js';
import { display_error_str, timeout_sec } from '../../../../global/config.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../../../utility/embed/error.js';
import { InteractionModule } from '../../../../global/types/module.js';
import { selectCreateAddRoleVillage } from '../../../../global/types/interaction_states.js';
import { t_error_code } from '../../../../global/types/list_str.js';
import { common_delete_create_timeout } from '../../common_process/delete_create_timeout.js';
import { isRoleId } from '../../../../global/types/other_types.js';
import { roles_common_process } from '../../common_process/roles.js';

const select_add_role_village_interaction: InteractionModule<StringSelectMenuInteraction, selectCreateAddRoleVillage> = {
    interaction_name: 'select_create_roles_village_team',
    states: {
        roles: {
            execute: async function (interaction: StringSelectMenuInteraction): Promise<void> {
                const clientId: string = interaction.user.id;

                if (interaction.values[0] === undefined || !isRoleId(interaction.values[0])) {
                    await interaction.update({ embeds: [await ui_error_fatal(clientId, 'U')], components: [] })
                    return;
                }

                //Roles process
                const roles_process_obj: {
                    error: false,
                    value: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
                        | [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
                } | {
                    error: true,
                    code: t_error_code
                } = await roles_common_process(clientId, {action: 'add_role', value: interaction.values[0]});
                if (roles_process_obj.error) {
                    await interaction.update({ embeds: [await ui_error_fatal(clientId, roles_process_obj.code)], components: [] })
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
                    await reply_msg.reply({embeds: [timeoutObj.embed], components: []});
                    return;
                }
                await reply_msg.edit({ embeds: [rolesEmbed, timeoutObj.embed], components: [] });
            }
        }
    },
    entry: async function(interaction: StringSelectMenuInteraction): Promise<void> {
        console.log('interaction run: select_create_roles_werewolf');
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
        await this.states.roles.execute(interaction);
    }
}

export default select_add_role_village_interaction;