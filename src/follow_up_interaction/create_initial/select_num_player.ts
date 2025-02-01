import { StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, Message, InteractionCallbackResource } from 'discord.js';
import { GameCreateInstance, GAME_CREATE } from '../../database/sqlite_db.js';
import { interaction_is_outdated, timeout_set, is_interaction_owner } from '../../utility/timeout.js';
import { get_display_text, get_display_error_code } from '../../utility/get_display.js';
import { config } from '../../text_data_config/config.js';
import { ui_create_initial } from '../../common_ui/create/initial.js';

async function select_create_initial_num_player(interaction: StringSelectMenuInteraction): Promise<void> {
    
    if (!(await is_interaction_owner(interaction.message.id, interaction.user.id))) {
        return;
    }

    console.log('create_initial: select_num_player');

    if (await interaction_is_outdated(interaction.message.id)) {
        const outdated_interaction_text: string[] = await get_display_text(['general.outdated_interaction'], interaction.user.id);
        await interaction.update({ content: outdated_interaction_text[0] ?? config['display_error'], components: [] });
        return;
    }

    if (interaction.values[0] === undefined) return;
    if (!(['6', '7', '8', '9', '10', '11', '12'].includes(interaction.values[0]))) return;
    const new_num_player: number = parseInt(interaction.values[0]);

    //Do sequelize thing here while get output text
    let num_player_selected: number = -1;
    let preset_selected: number = -1;
    let game_rule_selected: number = -1;
    const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: interaction.user.id } });

    if (settings !== null) {
        //Update first
        const [affectedCount] = await GAME_CREATE.update({ num_players: new_num_player }, { where: { clientId: interaction.user.id } });
        if (affectedCount <= 0) {
            await interaction.update({content: (await get_display_error_code('D3', interaction.user.id)) ?? config['display_error'], components: []});
            return;
        }
        //Set default selection
        num_player_selected = new_num_player;
        if (settings.is_preset !== null) {
            if (settings.is_preset == true) {
                preset_selected = 1;
            } else {
                preset_selected = 0;
            }
        }
        if (settings.game_rule !== null) {
            if (settings.game_rule === 'kill_all') {
                game_rule_selected = 0;
            } else if (settings.game_rule === 'kill_either') {
                game_rule_selected = 1;
            }
        }
    } else {
        try {
            await GAME_CREATE.create({
                clientId: interaction.user.id,
                status: 'initial',
                num_players: new_num_player,
                is_preset: null,
                sheriff: null,
                players_role: null,
                game_rule: null
            })
        }
        catch (error) {
            console.log(error);
            await interaction.update({content: (await get_display_error_code('D1', interaction.user.id)) ?? config['display_error'], components: []});
            return;
        }
    }

    //Success
    const time_sec: number = config['timeout_sec'].create.initial;
    const [ActionRowArr, Content, timeout_content]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], string, string]
        = await ui_create_initial(interaction.user.id, time_sec, num_player_selected, preset_selected, game_rule_selected);
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

export { select_create_initial_num_player }