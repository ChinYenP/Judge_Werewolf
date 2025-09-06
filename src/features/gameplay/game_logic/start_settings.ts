// import { t_role_id, t_fake_role_id } from "../../../global/types/other_types.js";
// import { i_player_info, ExtraInfo } from '../../../global/types/player_info.js';
// uncheck
// async function start_turn_order(turn_order: t_game_match_status[]): Promise<t_game_match_status[]> {
//     return (turn_order);
// }

// async function start_num_ability(role_list: t_role_id[]): Promise<number> {
//     let ability: number = 1;
//     role_list.length;
//     return (ability);
// }

// async function start_players_info(role_list: t_role_id[], fake_role_list: t_fake_role_id[]): Promise<i_player_info[]> {
    
//     let players_info: i_player_info[] = [];
//     for (const each_role_id of role_list) {
//         let extra_info: ExtraInfo<typeof each_role_id>;
//         switch (each_role_id) {
//             case 'W00':
//                 extra_info = { role_id: each_role_id, act: await random_fake_role(fake_role_list) } as ExtraInfo<'W00'>;
//                 break;
//             case 'G01':
//                 extra_info = { role_id: each_role_id, target: -1 } as ExtraInfo<'G01'>;
//                 break;
//             default:
//                 extra_info = { role_id: each_role_id };
//         }
//         players_info.push({
//             role_id: each_role_id,
//             dead: false,
//             sheriff: false,
//             target: [-1, -1],
//             extra_info: extra_info
//         })
//     }
//     return (players_info);


//     async function random_fake_role(fake_role_list: t_fake_role_id[]): Promise<t_fake_role_id> {
//         return (fake_role_list[Math.floor(Math.random() * fake_role_list.length)] ?? 'V00');
//     }
// }

// export { start_turn_order, start_num_ability, start_players_info }