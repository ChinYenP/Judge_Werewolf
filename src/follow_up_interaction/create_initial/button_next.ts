import { ButtonInteraction, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, Message, InteractionCallbackResource, EmbedBuilder } from 'discord.js';
import { GameCreateInstance, GAME_CREATE } from '../../database/sqlite_db.js';
import { interaction_is_outdated, timeout_set, is_interaction_owner } from '../../utility/timeout.js';
import { get_display_text } from '../../utility/get_display.js';
import { config } from '../../text_data_config/config.js';
import { ui_create_roles } from '../../common_ui/create/roles.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../common_ui/error.js';

async function button_create_initial_next(interaction: ButtonInteraction): Promise<void> {

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

    console.log('create_initial: button_next');

    const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });

    if (settings === null) {
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
        await interaction.update({embeds: [errorEmbed], components: []});
        return;
    }
    
    if (settings.is_preset === null || settings.num_players === null || settings.game_rule === null) return;

    //Update data to transition to create_roles
    const [affectedCount] = await GAME_CREATE.update({ status: 'roles', sheriff: false, players_role: [] }, { where: { clientId: clientId } });
    if (affectedCount <= 0) {
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D3');
        await interaction.update({embeds: [errorEmbed], components: []});
        return;
    }

    //////////////////////////////////////////////////////////////////////////////////
    //To do list: preset role lists
    //For now, the following code is for custom role list:
    const time_sec: number = config['timeout_sec'].create.roles;
    const [ActionRowArr, rolesEmbed, timeoutEmbed]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
        | [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder, EmbedBuilder]
    = await ui_create_roles(clientId, time_sec, settings.num_players, []);
    const update_msg_resource: InteractionCallbackResource = (await interaction.update({ embeds: [rolesEmbed], components: ActionRowArr, withResponse: true })).resource as InteractionCallbackResource;
    const update_msg: Message = update_msg_resource.message as Message;
    await timeout_set('create', update_msg.id, clientId, update_msg.channelId, time_sec, message_timeout, update_msg);

    async function message_timeout(update_msg: Message): Promise<void> {
        const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
        if (settings !== null) {
            try {
                await GAME_CREATE.destroy({ where: { clientId: clientId } });
            } catch (error) {
                console.error(error);
                const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
                await update_msg.edit({embeds: [errorEmbed], components: []});
                return;
            }
        }
        await update_msg.edit({ embeds: [rolesEmbed, timeoutEmbed], components: [] });
    }

}

export { button_create_initial_next }