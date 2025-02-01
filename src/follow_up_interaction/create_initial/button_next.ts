import { ButtonInteraction, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, Message, InteractionCallbackResource } from 'discord.js';
import { GameCreateInstance, GAME_CREATE } from '../../database/sqlite_db.js';
import { general_is_outdated, general_timeout_set, general_is_message_author } from '../../utility/timeout.js';
import { get_display_text, get_display_error_code } from '../../utility/get_display.js';
import { config } from '../../text_data_config/config.js';
import { ui_create_roles } from '../../common_ui/create/roles.js';

async function button_create_initial_next(interaction: ButtonInteraction): Promise<void> {
    
    if (!(await general_is_message_author(interaction.message.id, interaction.user.id))) {
        return;
    }

    console.log('create_initial: button_next');

    if (await general_is_outdated(interaction.message.id)) {
        const outdated_interaction_text: string[] = await get_display_text(['general.outdated_interaction'], interaction.user.id);
        if (outdated_interaction_text.length !== 1) {
            console.error('DSPY error at ./utility/create_initial/select_num_player.js, no1');
            await interaction.update({ content: config['display_error'], components: [] });
            return;
        }
        await interaction.update({ content: outdated_interaction_text[0] ?? config['display_error'], components: [] });
        return;
    }

    const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: interaction.user.id } });

    if (settings === null) {
        const display_arr: string[] = await get_display_error_code('U', interaction.user.id);
        if (display_arr.length !== 1) {
            console.error('DSPY error at ./utility/create_initial/select_num_player.js, no2');
            await interaction.message.edit({content: config['display_error'], components: []});
            return;
        }
        console.error(`U error at ./utility/create_initial/select_num_player.js, no3`);
        await interaction.update({content: display_arr[0] ?? config['display_error'], components: []});
        return;
    }
    
    if (settings.is_preset === null || settings.num_players === null || settings.game_rule === null) return;

    //Update data to transition to create_roles
    const [affectedCount] = await GAME_CREATE.update({ status: 'roles', sheriff: false, players_role: [] }, { where: { clientId: interaction.user.id } });
    if (affectedCount <= 0) {
        const display_arr: string[] = await get_display_error_code('D3', interaction.user.id);
        if (display_arr.length !== 1) {
            console.error('DSPY error at ./utility/create_initial/select_num_player.js, no2');
            await interaction.message.edit({content: config['display_error'], components: []});
            return;
        }
        console.error(`D3 error at ./utility/create_initial/select_num_player.js, no3`);
        await interaction.update({content: display_arr[0] ?? config['display_error'], components: []});
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
    await general_timeout_set('create', update_msg.id, interaction.user.id, update_msg.channelId, time_sec, message_timeout, update_msg);

    async function message_timeout(update_msg: Message): Promise<void> {
        const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: interaction.user.id } });
        if (settings !== null) {
            try {
                await GAME_CREATE.destroy({ where: { clientId: interaction.user.id } });
            } catch (error) {
                console.error(error);
                const display_arr: string[] = await get_display_error_code('D2', interaction.user.id);
                if (display_arr.length !== 1) {
                    console.error('DSPY error at ./utility/create_initial/select_num_player.js, no6');
                    await update_msg.edit({content: config['display_error'], components: []});
                    return;
                }
                console.error(`D3 error at ./utility/create_initial/select_num_player.js, no7`);
                await update_msg.edit({content: display_arr[0] ?? config['display_error'], components: []});
                return;
            }
        }
        await update_msg.edit({ content: timeout_content, components: [] });
    }

}

export { button_create_initial_next }