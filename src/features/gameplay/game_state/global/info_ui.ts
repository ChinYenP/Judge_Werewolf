import { EmbedBuilder } from 'discord.js';
import { get_display_text, get_game_text } from '../../../../utility/get_display.js';
import { display_error_str, embed_hex_color } from '../../../../global/config.js';
import { GameMatchInstance } from '../../../../global/sqlite_db.js';

async function ui_gameplay_info(clientId: string, game_match: GameMatchInstance): Promise<EmbedBuilder> {
    
    const [ title_text, sheriff_title, sheriff_enabled, sheriff_disabled, game_rule_title, kill_all_text,
        kill_either_text, death_title, death_front_text, death_back_text, role_list_title, fake_role_list_title,
        survived_text, dead_text ]: string[]
    = await get_display_text(['gameplay.info_embed.title', 'gameplay.info_embed.sheriff_mode.title',
        'gameplay.info_embed.sheriff_mode.enabled', 'gameplay.info_embed.sheriff_mode.disabled',
        'gameplay.info_embed.game_rule.title', 'gameplay.info_embed.game_rule.kill_all',
        'gameplay.info_embed.game_rule.kill_either', 'gameplay.info_embed.death_requirement.title',
        'gameplay.info_embed.death_requirement.description_front',
        'gameplay.info_embed.death_requirement.description_back', 'gameplay.info_embed.role_list',
        'gameplay.info_embed.fake_role_list', 'gameplay.info_embed.survived', 'gameplay.info_embed.dead'], clientId);
    
    const sheriff_desc_text: string | undefined = game_match.sheriff ? sheriff_enabled : sheriff_disabled;
    const game_rule_desc_text: string | undefined = (game_match.game_rule === 'kill_all') ? kill_all_text : kill_either_text;

    let role_list_content: string = '';
    let i: number = 1;
    for (const [each_role_id, count] of game_match.role_count) {
        role_list_content += `${await get_game_text(each_role_id, 'name', clientId)} x${String(count)}`;
        if (i != game_match.role_count.length) {
            role_list_content += '\n';
        }
        i++;
    }

    let fake_role_list_content: string = '';
    i = 1;
    for (const each_role_id of game_match.fake_role_list) {
        fake_role_list_content += await get_game_text(each_role_id, 'name', clientId);
        if (i != game_match.fake_role_list.length) {
            fake_role_list_content += ', ';
        }
        i++;
    }

    let survived_content: string = '';
    let dead_content: string = '';
    i = 1;
    for (const player_info of game_match.players_info) {
        if (player_info.dead) {
            if (dead_content !== '') {
                dead_content += ', ';
            }
            dead_content += String(i);
        } else {
            if (survived_content !== '') {
                survived_content += ', ';
            }
            survived_content += String(i);
        }
        i++;
    }
    
    const infoEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(embed_hex_color)
        .setTitle(title_text ?? display_error_str)
        .addFields(
            {
                name: sheriff_title ?? display_error_str,
                value: sheriff_desc_text ?? display_error_str
            },
            {
                name: game_rule_title ?? display_error_str,
                value: game_rule_desc_text ?? display_error_str
            },
            {
                name: death_title ?? display_error_str,
                value: `${death_front_text ?? display_error_str}${String(game_match.consecutive_no_death)}${death_back_text ?? display_error_str}`
            },
            {
                name: role_list_title ?? display_error_str,
                value: role_list_content
            },
            {
                name: fake_role_list_title ?? display_error_str,
                value: fake_role_list_content
            },
            {
                name: survived_text ?? display_error_str,
                value: survived_content
            },
            {
                name: dead_text ?? display_error_str,
                value: dead_content
            }
        )
        .setTimestamp()

    return (infoEmbed);
}

export { ui_gameplay_info }