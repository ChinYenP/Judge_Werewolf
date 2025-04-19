import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { GameCreateInstance, GAME_CREATE, GAME_MATCH } from '../../../database/sqlite_db.js';
import { interaction_is_outdated, is_interaction_owner, timeout_delete_message } from '../../../utility/timeout.js';
import { get_display_text, get_role_list_order } from '../../../utility/get_display.js';
import { config } from '../../../text_data_config/config.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../../common_ui/error.js';
import { win_condition_in_role } from '../../../gameplay/game_logic/win_condition.js';
import { start_turn_order, start_num_ability, start_players_info } from '../../../gameplay/game_logic/start_settings.js';
import { game_next_state } from '../../../gameplay/game_logic/next_state.js';
import { isMyClient, t_fake_role_id, fake_role_id } from '../../../declare_type/type_guard.js';
import { compareRoleId } from '../../../utility/compareFn.js';

async function button_create_final_start(interaction: ButtonInteraction): Promise<void> {

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

    if (!isMyClient(interaction.client)) return;

    console.log('create_final: button_start_game');

    const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });

    if (game_create === null) {
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
        await interaction.update({embeds: [errorEmbed], components: []});
        return;
    }
    
    if (game_create.is_preset === null || game_create.num_players === null || game_create.game_rule === null
        || game_create.sheriff === null || game_create.players_role === null) return;
    if (game_create.players_role.length !== game_create.num_players) return;
    if ((await win_condition_in_role(game_create.players_role, game_create.game_rule)) !== 'unknown') return;

    await timeout_delete_message(clientId, 'create', interaction.client);

    let fake_role_list: t_fake_role_id[] = [];
    for (const each_role_id of game_create.players_role) {
        if (fake_role_id.includes(each_role_id) && !fake_role_list.includes(each_role_id)) {
            fake_role_list.push(each_role_id);
        }
    }

    //Create game_match
    try {
        await GAME_MATCH.create({
            clientId: clientId,
            status: 'night',
            turn_order: await start_turn_order(['night']),
            num_days: 0,
            sheriff: game_create.sheriff,
            game_rule: game_create.game_rule,
            consecutive_no_death: config["gameplay"]["consecutive_no_death"],
            num_ability: await start_num_ability(game_create.players_role),
            role_count: await get_role_list_order(game_create.players_role),
            fake_role_list: fake_role_list.sort(compareRoleId),
            players_info: await start_players_info(game_create.players_role, fake_role_list)
        })
    }
    catch (error) {
        console.log(error);
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D1');
        await interaction.update({embeds: [errorEmbed], components: []});
        return;
    }

    
    //Destroy game_create
    try {
        await GAME_CREATE.destroy({ where: { clientId: clientId } });
    } catch (error) {
        console.error(error);
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
        await interaction.reply({embeds: [errorEmbed], components: []});
        return;
    }

    await game_next_state(clientId, interaction);

}

export { button_create_final_start }