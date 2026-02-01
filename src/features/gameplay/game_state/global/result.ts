import { EmbedBuilder } from 'discord.js';
import { t_error_code, t_win_con } from '../../../../global/types/list_str.js';
import { GAME_MATCH, GameMatchInstance } from '../../../../global/sqlite_db.js';
import { get_display_text, get_game_text } from '../../../../utility/get_display.js';
import { display_error_str, embed_hex_color } from '../../../../global/config.js';

export async function game_result(clientId: string, win_con: Exclude<t_win_con,'unknown'>, prevStateEmbed: EmbedBuilder | null, score: number = 0): Promise<{error: true, code: t_error_code} |
{error: false, end: true, prevStateEmbed: EmbedBuilder | null, resultEmbed: EmbedBuilder}> {

    const game_match: GameMatchInstance | null = await GAME_MATCH.findOne({ where: { clientId: clientId } });
    if (game_match === null) {
        return ({error: true, code: 'D4'});
    }
    const [score_title, player_roles_title]: string[] = await get_display_text(['gameplay.result.score', 'gameplay.result.player_roles'], clientId);
    let title_text: string = '';
    switch (win_con) {
        case 'werewolf': {
            const [text1]: string[] = await get_display_text(['gameplay.result.title.werewolf'], clientId);
            title_text = text1 ?? display_error_str;
            score = 0;
            break;
        }
        case 'village': {
            const [text2]: string[] = await get_display_text(['gameplay.result.title.village'], clientId);
            title_text = text2 ?? display_error_str;
            score = 0;
            break;
        }
        case 'tie': {
            const [text3]: string[] = await get_display_text(['gameplay.result.title.tie'], clientId);
            title_text = text3 ?? display_error_str;
            score = 0;
            break;
        }
        case 'guessed': {
            const [text4]: string[] = await get_display_text(['gameplay.result.title.guessed'], clientId);
            title_text = text4 ?? display_error_str;
            break;
        }
        case 'timeout': {
            const [text5]: string[] = await get_display_text(['gameplay.result.title.timeout'], clientId);
            title_text = text5 ?? display_error_str;
            score = 0;
            break;
        }
        case 'cancel': {
            const [text6]: string[] = await get_display_text(['gameplay.result.title.cancel'], clientId);
            title_text = text6 ?? display_error_str;
            score = 0;
            break;
        }
    }

    let player_roles_desc: string = '';
    let i: number = 1;
    for (const player_info of game_match.players_info) {
        player_roles_desc += `${String(i)}: ${await get_game_text(player_info.role_id, 'name', clientId)}`;
        if (i !== game_match.players_info.length) player_roles_desc += '\n';
        i++;
    }

    const resultEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(embed_hex_color)
        .setTitle(title_text)
        .addFields(
            {
                name: score_title ?? display_error_str,
                value: `${String(score)}/${String(game_match.players_info.length)}`
            },
            {
                name: player_roles_title ?? display_error_str,
                value: player_roles_desc
            }
        )
        .setTimestamp()

    //Delete row from database
    try {
        await GAME_MATCH.destroy({ where: { clientId: clientId } });
    } catch (error) {
        console.error(error);
        return ({error: true, code: 'D2'});
    }

    return ({error: false, end: true, prevStateEmbed: prevStateEmbed, resultEmbed: resultEmbed});
}