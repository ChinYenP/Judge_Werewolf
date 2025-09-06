// import { EmbedBuilder } from 'discord.js';
// import { get_display_text, get_game_text } from '../utility/texts/get_display.js';
// import { config } from '../../global/config.js';
// import { GameMatchInstance } from '../../global/sqlite_db.js';
// uncheck

// async function ui_gameplay_info(clientId: string, game_match: GameMatchInstance): Promise<EmbedBuilder> {
    
//     const [ title_text, sheriff_title, sheriff_enabled, sheriff_disabled, game_rule_title, kill_all_text,
//         kill_either_text, death_title, death_front_text, death_back_text, role_list_title, fake_role_list_title ]: string[]
//     = await get_display_text(['gameplay.info_embed.title', 'gameplay.info_embed.sheriff_mode.title',
//         'gameplay.info_embed.sheriff_mode.enabled', 'gameplay.info_embed.sheriff_mode.disabled',
//         'gameplay.info_embed.game_rule.title', 'gameplay.info_embed.game_rule.kill_all',
//         'gameplay.info_embed.game_rule.kill_either', 'gameplay.info_embed.death_requirement.title',
//         'gameplay.info_embed.death_requirement.description_front',
//         'gameplay.info_embed.death_requirement.description_back', 'gameplay.info_embed.role_list',
//         'gameplay.info_embed.fake_role_list'], clientId);

    
//     let sheriff_desc_text: string | undefined;
//     let game_rule_desc_text: string | undefined;
//     if (game_match.sheriff) {
//         sheriff_desc_text = sheriff_enabled;
//     } else {
//         sheriff_desc_text = sheriff_disabled;
//     }
//     if (game_match.game_rule === 'kill_all') {
//         game_rule_desc_text = kill_all_text;
//     } else {
//         game_rule_desc_text = kill_either_text;
//     }

//     let role_list_content: string = '';
//     let i: number = 1;
//     for (const [each_role_id, count] of game_match.role_count) {
//         role_list_content += `${await get_game_text(each_role_id, 'name', clientId)} x${count}`;
//         if (i != game_match.role_count.length) {
//             role_list_content += '\n';
//         }
//         i++;
//     }

//     let fake_role_list_content: string = '';
//     i = 1;
//     for (const each_role_id of game_match.fake_role_list) {
//         fake_role_list_content += await get_game_text(each_role_id, 'name', clientId);
//         if (i != game_match.fake_role_list.length) {
//             fake_role_list_content += ', ';
//         }
//         i++;
//     }
    
//     const infoEmbed: EmbedBuilder = new EmbedBuilder()
//         .setColor(config['embed_hex_color'])
//         .setTitle(title_text ?? config['display_error'])
//         .addFields(
//             {
//                 name: sheriff_title ?? config['display_error'],
//                 value: sheriff_desc_text ?? config['display_error']
//             },
//             {
//                 name: game_rule_title ?? config['display_error'],
//                 value: game_rule_desc_text ?? config['display_error']
//             },
//             {
//                 name: death_title ?? config['display_error'],
//                 value: `${death_front_text}${String(game_match.consecutive_no_death)}${death_back_text}`
//             },
//             {
//                 name: role_list_title ?? config['display_error'],
//                 value: role_list_content ?? config['display_error']
//             },
//             {
//                 name: fake_role_list_title ?? config['display_error'],
//                 value: fake_role_list_content ?? config['display_error']
//             }
//         )
//         .setTimestamp()

//     return (infoEmbed);
// }

// export { ui_gameplay_info }