import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { GameMatchInstance, GAME_MATCH } from '../../../global/sqlite_db.js';
import { ui_gameplay_info } from '../game_state/global/info_ui.js';
import { win_condition } from './win_condition.js';
import { game_result } from '../game_state/global/result.js';
import { t_error_code,  t_win_con } from '../../../global/types/list_str.js';
import { t_game_match_state } from '../../../global/types/other_types.js';
import { ui_night } from '../game_state/night/ui.js';
import { ui_hunter } from '../game_state/roles/hunter/ui.js';
import { ui_day } from '../game_state/day_vote/ui.js';

async function game_next_state(clientId: string, prevStateEmbed: EmbedBuilder | null): Promise<{error: true, code: t_error_code} |
{error: false, end: false, infoEmbed: EmbedBuilder, prevStateEmbed: EmbedBuilder | null, stateEmbed: EmbedBuilder, components: (ActionRowBuilder<StringSelectMenuBuilder> | ActionRowBuilder<ButtonBuilder>)[]} |
{error: false, end: true, prevStateEmbed: EmbedBuilder | null, resultEmbed: EmbedBuilder}> {
    const game_match: GameMatchInstance | null = await GAME_MATCH.findOne({ where: { clientId: clientId } });
    if (game_match === null) {
        return ({error: true, code: 'D4'});
    }
    if (game_match.turn_order[0] === undefined) {
        try {
            await GAME_MATCH.destroy({ where: { clientId: clientId } });
        } catch (error) {
            console.error(error);
            return ({error: true, code: 'D2'});
        }
        return ({error: true, code: 'U'});
    }

    //Check win condition
    const win_con: t_win_con = win_condition(game_match.players_info, game_match.game_rule, game_match.consecutive_no_death);
    if (win_con !== 'unknown') {
        return (await game_result(clientId, win_con, prevStateEmbed));
    }

    //Prepare info embed
    const infoEmbed: EmbedBuilder = await ui_gameplay_info(clientId, game_match);
    
    //Set respective next turn
    let new_turn_order: t_game_match_state[] = game_match.turn_order;
    const first_state: t_game_match_state | undefined = new_turn_order.shift();
    if (first_state === undefined) {
        console.error('first_state is empty. Impossible case.');
        return ({error: true, code: 'U'});
    }
    /*
    Game Flow: next_state -> UI -> wait interaction -> logic -> transition -> next_state
    DO NOT append any states here.
    */
    switch (first_state) {
        case 'night':
            const [affectedCount1] = await GAME_MATCH.update({ num_days: game_match.num_days + 1, turn_order: new_turn_order, status: {status: 'night', selecting: { target1: null, target2: null, ability: null }, actions: []} }, { where: { clientId: clientId } });
            if (affectedCount1 <= 0) {
                return ({error: true, code: 'D3'});
            }
            const ui_data_night: {action_rows: (ActionRowBuilder<StringSelectMenuBuilder> | ActionRowBuilder<ButtonBuilder>)[], embed: EmbedBuilder}
                = await ui_night(clientId, game_match.num_days + 1, game_match.num_ability, { target1: null, target2: null, ability: null }, [], game_match.players_info);
            return ({error: false, end: false, infoEmbed: infoEmbed, prevStateEmbed: prevStateEmbed, stateEmbed: ui_data_night.embed, components: ui_data_night.action_rows});
        case 'day_vote':
            const [affectedCount2] = await GAME_MATCH.update({ turn_order: new_turn_order, status: {status: 'day_vote', lynch: null} }, { where: { clientId: clientId } });
            if (affectedCount2 <= 0) {
                return ({error: true, code: 'D3'});
            }
            const ui_data_day_vote: {action_rows: [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], embed: EmbedBuilder}
                = await ui_day(clientId, game_match.num_days, null, game_match.players_info);
            return ({error: false, end: false, infoEmbed: infoEmbed, prevStateEmbed: prevStateEmbed, stateEmbed: ui_data_day_vote.embed, components: ui_data_day_vote.action_rows});
        case 'hunter_night':
        case 'hunter_day':
            const [affectedCount3] = await GAME_MATCH.update({ turn_order: new_turn_order, status: {status: first_state, target: null} }, { where: { clientId: clientId } });
            if (affectedCount3 <= 0) {
                return ({error: true, code: 'D3'});
            }
            const ui_data_hunter: {action_rows: [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], embed: EmbedBuilder}
                = await ui_hunter(clientId, game_match.num_days, null, game_match.players_info);
            return ({error: false, end: false, infoEmbed: infoEmbed, prevStateEmbed: prevStateEmbed, stateEmbed: ui_data_hunter.embed, components: ui_data_hunter.action_rows});
    }
    console.error('No matching states.');
    return ({error: true, code: 'U'});
}

export { game_next_state }