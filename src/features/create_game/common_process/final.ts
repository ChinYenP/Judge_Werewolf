import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';
import { GameCreateInstance, GAME_CREATE } from '../../../global/sqlite_db.js';
import { ui_create_final } from '../embed/final.js';
import { t_error_code } from '../../../global/types/list_str.js';
import { win_condition_in_role } from '../../gameplay/game_logic/win_condition.js';

async function final_common_process(clientId: string): Promise<{
        error: false,
        value: [[ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
    } | {
        error: true,
        code: t_error_code
    }> {
    const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
    if (game_create === null || game_create.is_preset === null || game_create.num_players === null || game_create.game_rule === null
        || game_create.sheriff === null || game_create.players_role === null) {
        return ({error: true, code: 'U'});
    }
    if (win_condition_in_role(game_create.players_role, game_create.game_rule) !== 'unknown') {
        return ({error: true, code: 'U'});
    }
    const [ActionRowArr, finalEmbed]: [[ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
    = await ui_create_final(clientId, {
        "num_roles_max": game_create.num_players,
        "sheriff": game_create.sheriff,
        "game_rule": game_create.game_rule,
        "roles_list": game_create.players_role
    });
    return ({error: false, value: [ActionRowArr, finalEmbed]});
}

export { final_common_process };