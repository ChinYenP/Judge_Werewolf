import { StringSelectMenuInteraction, ButtonInteraction, EmbedBuilder } from 'discord.js';
import { GameMatchInstance, GAME_MATCH } from '../../database/sqlite_db.js';
import { ui_error_fatal } from '../../common_ui/error.js';
import { ui_gameplay_info } from '../info_ui.js';
import { win_condition } from '../game_logic/win_condition.js';
import { game_result } from '../game_state/guess/result.js';
import { game_night } from '../game_state/night/night.js';

async function game_next_state(clientId: string, interaction: StringSelectMenuInteraction | ButtonInteraction,): Promise<void> {
    const game_match: GameMatchInstance | null = await GAME_MATCH.findOne({ where: { clientId: clientId } });
    if (game_match === null) {
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D4');
        await interaction.reply({embeds: [errorEmbed], components: []});
        return;
    }
    if (game_match.turn_order[0] === undefined) {
        try {
            await GAME_MATCH.destroy({ where: { clientId: clientId } });
        } catch (error) {
            console.error(error);
            const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
            await interaction.reply({embeds: [errorEmbed], components: []});
            return;
        }
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
        await interaction.reply({embeds: [errorEmbed], components: []});
        return;
    }

    //Check win condition
    const win_con: t_win_con = await win_condition(game_match.players_info, game_match.game_rule, game_match.consecutive_no_death);
    if (win_con !== 'unknown') {
        await game_result(clientId, interaction, win_con);
        return;
    }

    //Prepare info embed
    const infoEmbed: EmbedBuilder = await ui_gameplay_info(clientId, game_match);
    
    //Set respective next turn
    let new_turn_order: t_game_match_status[] = game_match.turn_order;
    const first_state: t_game_match_status = new_turn_order.shift() as t_game_match_status;
    const [affectedCount] = await GAME_MATCH.update({ turn_order: new_turn_order }, { where: { clientId: clientId } });
    if (affectedCount <= 0) {
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D3');
        await interaction.update({embeds: [errorEmbed], components: []});
        return;
    }
    /*
    Note:
    - For action that doesn't proceed next phase (like night/day), append same night/day before reach here
    - For action that are ready to proceed next phase, append next phase before reach here
    - If there are multiple actions before next phase (like hunter), append them before next phase
    - DO NOT append any phase after exit a non-phase action (like hunter). If going into same action, append same action.
    */
    switch (first_state) {
        case 'night':
            await game_night(clientId, infoEmbed);
            break;
        case 'sheriff':
            console.log("Not yet!");
            break;
        case 'day_ability':
            console.log("Not yet!");
            break;
        case 'day_vote':

            break;
        case 'hunter':

            break;
    }
}

export { game_next_state }