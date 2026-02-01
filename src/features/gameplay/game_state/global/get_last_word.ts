import { display_error_str } from "../../../../global/config.js";
import { t_error_code } from "../../../../global/types/list_str.js";
import { isWerewolfRoleId, t_role_id } from "../../../../global/types/other_types.js";
import { i_player_info } from "../../../../global/types/player_info.js";
import { get_display_text, get_game_text } from "../../../../utility/get_display.js";

export async function get_last_word(clientId: string, player_info: i_player_info, player_num: number): Promise<{error: false, last_word: string} | {error: true, code: t_error_code}> {
    const [last_word_text]: string[] = await get_display_text(['gameplay.last_word'], clientId);
    let last_word_role: t_role_id;
    if (isWerewolfRoleId(player_info.role_id)) {
        if (!('act' in player_info.extra_info)) {
            console.error('A werewolf must have act properties.');
            return ({error: true, code: 'U'});
        }
        last_word_role = player_info.extra_info.act;
    } else {
        last_word_role = player_info.role_id;
    }
    return ({error: false, last_word: `${String(player_num)}: ${last_word_text ?? display_error_str} ${await get_game_text(last_word_role, 'name', clientId)}`});
}