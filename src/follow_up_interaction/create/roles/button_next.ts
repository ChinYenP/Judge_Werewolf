import { ButtonInteraction, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, Message, InteractionCallbackResource, EmbedBuilder } from 'discord.js';
import { GameCreateInstance, GAME_CREATE } from '../../../database/sqlite_db.js';
import { interaction_is_outdated, timeout_set, is_interaction_owner } from '../../../utility/timeout.js';
import { get_display_text } from '../../../utility/get_display.js';
import { config } from '../../../text_data_config/config.js';
import { ui_create_roles } from '../../../common_ui/create/roles.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../../common_ui/error.js';
import { ui_create_final } from '../../../common_ui/create/final.js';
import { win_condition_in_role } from '../../../gameplay/game_logic/win_condition.js';

async function button_create_roles_next(interaction: ButtonInteraction): Promise<void> {

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

    console.log('create_roles: button_next');

    const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });

    if (settings === null) {
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
        await interaction.update({embeds: [errorEmbed], components: []});
        return;
    }
    
    if (settings.is_preset === null || settings.num_players === null || settings.game_rule === null
        || settings.sheriff === null || settings.players_role === null) return;
    if (settings.players_role.length !== settings.num_players) return;

    //Check win condition
    if ((await win_condition_in_role(settings.players_role, settings.game_rule)) !== 'tie') {
        //Send error embed, and then display same as create roles.

        const [ win_con_text ]: string[] = await get_display_text(['create.roles.win_con_met'], clientId);

        const winConEmbed: EmbedBuilder = await ui_error_non_fatal(clientId, win_con_text ?? config['display_error']);

        const time_sec: number = config['timeout_sec'].create.roles;
        const [ActionRowArr, rolesEmbed, timeoutEmbed]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
            | [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder, EmbedBuilder]
        = await ui_create_roles(clientId, time_sec, settings.num_players, settings.players_role);
        const update_msg_resource: InteractionCallbackResource = (await interaction.update({ embeds: [rolesEmbed, winConEmbed], components: ActionRowArr, withResponse: true })).resource as InteractionCallbackResource;
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
            await update_msg.edit({ embeds: [rolesEmbed, winConEmbed, timeoutEmbed], components: [] });
        }
        return;
    }


    //Update data to transition to create_final
    const [affectedCount] = await GAME_CREATE.update({ status: 'final' }, { where: { clientId: clientId } });
    if (affectedCount <= 0) {
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D3');
        await interaction.update({embeds: [errorEmbed], components: []});
        return;
    }
    
    const time_sec: number = config['timeout_sec'].create.final;
    const [ActionRowArr, finalEmbed, timeoutEmbed]: [[ActionRowBuilder<ButtonBuilder>], EmbedBuilder, EmbedBuilder]
    = await ui_create_final(clientId, time_sec, {
        "num_roles_max": settings.num_players,
        "sheriff": settings.sheriff,
        "game_rule": settings.game_rule,
        "roles_list": settings.players_role
    });
    const update_msg_resource: InteractionCallbackResource = (await interaction.update({ embeds: [finalEmbed], components: ActionRowArr, withResponse: true })).resource as InteractionCallbackResource;
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
        await update_msg.edit({ embeds: [finalEmbed, timeoutEmbed], components: [] });
    }

}

export { button_create_roles_next }