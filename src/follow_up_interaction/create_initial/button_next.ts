import { ButtonInteraction, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, Message, InteractionCallbackResource } from 'discord.js';
import { GameCreateInstance, GAME_CREATE } from '../../database/sqlite_db.js';
import { interaction_is_outdated, timeout_set, is_interaction_owner } from '../../utility/timeout.js';
import { get_display_text, get_display_error_code } from '../../utility/get_display.js';
import { config } from '../../text_data_config/config.js';
import { ui_create_roles } from '../../common_ui/create/roles.js';

async function button_create_initial_next(interaction: ButtonInteraction): Promise<void> {
    
    if (!(await is_interaction_owner(interaction.message.id, interaction.user.id))) {
        return;
    }

    console.log('create_initial: button_next');

    if (await interaction_is_outdated(interaction.message.id)) {
        const outdated_interaction_text: string[] = await get_display_text(['general.outdated_interaction'], interaction.user.id);
        await interaction.update({ content: outdated_interaction_text[0] ?? config['display_error'], components: [] });
        return;
    }

    const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: interaction.user.id } });

    if (settings === null) {
        await interaction.update({content: (await get_display_error_code('U', interaction.user.id)) ?? config['display_error'], components: []});
        return;
    }
    
    if (settings.is_preset === null || settings.num_players === null || settings.game_rule === null) return;

    //Update data to transition to create_roles
    const [affectedCount] = await GAME_CREATE.update({ status: 'roles', sheriff: false, players_role: [] }, { where: { clientId: interaction.user.id } });
    if (affectedCount <= 0) {
        await interaction.update({content: (await get_display_error_code('D3', interaction.user.id)) ?? config['display_error'], components: []});
        return;
    }

    //////////////////////////////////////////////////////////////////////////////////
    //To do list: preset role lists
    //For now, the following code is for custom role list:
    const time_sec: number = config['timeout_sec'].create.roles;
    const [ActionRowArr, Content, timeout_content]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], string, string]
        = await ui_create_roles(interaction.user.id, time_sec, []);
    const update_msg_resource: InteractionCallbackResource = (await interaction.update({ content: Content, components: ActionRowArr, withResponse: true })).resource as InteractionCallbackResource;
    const update_msg: Message = update_msg_resource.message as Message;
    await timeout_set('create', update_msg.id, interaction.user.id, update_msg.channelId, time_sec, message_timeout, update_msg);

    async function message_timeout(update_msg: Message): Promise<void> {
        const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: interaction.user.id } });
        if (settings !== null) {
            try {
                await GAME_CREATE.destroy({ where: { clientId: interaction.user.id } });
            } catch (error) {
                console.error(error);
                await update_msg.edit({content: (await get_display_error_code('D2', interaction.user.id)) ?? config['display_error'], components: []});
                return;
            }
        }
        await update_msg.edit({ content: timeout_content, components: [] });
    }

}

export { button_create_initial_next }