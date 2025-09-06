// import { Message, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';
// import { get_display_text } from '../utility/texts/get_display.js';
// import { check_cooldown } from '../../utility/cooldown/check_cooldown.js';
// import { timeout_set, delete_message } from '../../utility/timeout/timeout.js';
// import { t_role_id } from '../../global/types/other_types.js';
// import { config } from '../../global/config.js';
// import { GameCreateInstance, GAME_CREATE } from '../../global/sqlite_db.js';
// import { ui_create_initial } from './embed/initial.js';
// import { ui_create_roles } from './embed/roles.js';
// import { ui_create_final } from './embed/final.js';
// import { ui_error_non_fatal, ui_error_fatal } from '../../utility/embed/error.js';
// import { ui_invalid_game_id } from '../../utility/embed/invalid_game_id.js';
// import { game_id_validation } from '../../utility/validation/game_id_validation.js';
// uncheck
// export default {

//     name: 'create',
//     cooldown_sec: config['cooldown_sec'].create,
//     async execute(message: Message, args: string[]): Promise<void> {
//         console.log(`Create command ran, args: ${args.join(", ")}`);

//         const clientId: string = message.author.id;
//         if (!await check_cooldown(clientId, this.name, this.cooldown_sec, message.client, message)) {
//             return;
//         }

//         //Check arguments
//         if (args.length > 1) {
//             //Too much arguments
//             const [much_args_text]: string[] = await get_display_text(['general.command_args_error.much_args'], clientId);
//             const much_args_embed: EmbedBuilder = await ui_error_non_fatal(clientId, `create ${much_args_text ?? config['display_error']}`);
//             await message.reply({embeds: [much_args_embed], components: []});
//             return;
//         }

//         //Create by ID
//         if (args.length === 1) {
//             //If the game has already created, stop new game creation.
//             const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
//             if (game_create !== null) {
//                 const [creating_error_text]: string[] = await get_display_text(['create.creating_error'], clientId);
//                 const creating_err_embed: EmbedBuilder = await ui_error_non_fatal(clientId, creating_error_text ?? config['display_error']);
//                 await message.reply({embeds: [creating_err_embed], components: []});
//                 return;
//             }
//             const validate: [boolean, {} | {
//                 'num_roles_max': number,
//                 'sheriff': boolean,
//                 'game_rule': t_game_rule,
//                 'roles_list': t_role_id[]}, string] = await game_id_validation(args[0] ?? '', clientId);
//             if (!(validate[0])) {
//                 const invalidEmbed: EmbedBuilder = await ui_invalid_game_id(clientId, args[0] ?? '', validate[2]);
//                 try {
//                     await message.reply({ embeds: [invalidEmbed] });
//                 } catch (error) {
//                     console.error(error);
//                     const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'M1');
//                     await message.reply({embeds: [errorEmbed], components: []});
//                 }
//             } else {
//                 await create_roles_by_id(message, clientId, config['timeout_sec'].create.roles, validate[1] as {
//                     'num_roles_max': number,
//                     'sheriff': boolean,
//                     'game_rule': t_game_rule,
//                     'roles_list': t_role_id[]});
//             }
//             return;
//         }

//         //For general create
//         await delete_message(clientId, 'create', message.client);
//         const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
//         if (game_create !== null) {
//             if (game_create.status === 'roles') {
//                 if (game_create.is_preset === null || game_create.num_players === null || game_create.game_rule === null
//                     || game_create.sheriff === null || game_create.players_role === null) return;
//                 await create_roles(message, clientId, config['timeout_sec'].create.roles, game_create);
//                 return;
//             } else if (game_create.status === 'final') {
//                 if (game_create.is_preset === null || game_create.num_players === null || game_create.game_rule === null
//                     || game_create.sheriff === null || game_create.players_role === null) return;
//                 await create_final(message, clientId, config['timeout_sec'].create.final, game_create);
//                 return;
//             }
//         }
//         await create_initial(message, clientId, config['timeout_sec'].create.initial, game_create);
//     }
// }


// async function create_initial(message: Message, clientId: string, time_sec: number, game_create: GameCreateInstance | null): Promise<void> {

//     let num_player_selected: number = -1;
//     let preset_selected: number = -1;
//     let game_rule_selected: number = -1;

//     if (game_create !== null) {
//         if (game_create.num_players !== null) {
//             num_player_selected = game_create.num_players;
//         }
//         if (game_create.is_preset !== null) {
//             if (game_create.is_preset === true) {
//                 preset_selected = 1;
//             } else {
//                 preset_selected = 0;
//             }
//         }
//         if (game_create.game_rule !== null) {
//             if (game_create.game_rule === 'kill_all') {
//                 game_rule_selected = 0;
//             } else if (game_create.game_rule === 'kill_either') {
//                 game_rule_selected = 1;
//             }
//         }
//     } else {
//         try {
//             await GAME_CREATE.create({
//                 clientId: clientId,
//                 status: 'initial',
//                 num_players: null,
//                 is_preset: null,
//                 sheriff: null,
//                 players_role: null,
//                 game_rule: null
//             })
//         }
//         catch (error) {
//             console.log(error);
//             const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D1');
//             await message.reply({embeds: [errorEmbed], components: []});
//             return;
//         }
//     }

//     const [ActionRowArr, initialEmbed, timeoutEmbed]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>,
//         ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder, EmbedBuilder]
//         = await ui_create_initial(clientId, time_sec, num_player_selected, preset_selected, game_rule_selected);
//     const bot_reply: Message = await message.reply({ embeds: [initialEmbed], components: ActionRowArr });
//     await timeout_set('create', bot_reply.id, clientId, message.channelId, time_sec, message_timeout, bot_reply);

//     async function message_timeout(bot_reply: Message): Promise<void> {
//         const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
//         if (game_create !== null) {
//             try {
//                 await GAME_CREATE.destroy({ where: { clientId: clientId } });
//             } catch (error) {
//                 console.error(error);
//                 const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
//                 await message.reply({embeds: [errorEmbed], components: []});
//                 return;
//             }
//         }
//         await bot_reply.edit({ embeds: [initialEmbed, timeoutEmbed], components: [] });
//     }
// }


// async function create_roles_by_id(message: Message, clientId: string, time_sec: number, game_data: {
//     'num_roles_max': number,
//     'sheriff': boolean,
//     'game_rule': t_game_rule,
//     'roles_list': t_role_id[]}): Promise<void> {
    
//     const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
//     if (game_create !== null) {
//         const [affectedCount] = await GAME_CREATE.update({
//             status: 'roles',
//             num_players: game_data['num_roles_max'],
//             is_preset: false,
//             sheriff: game_data['sheriff'],
//             players_role: game_data['roles_list'],
//             game_rule: game_data['game_rule']
//         }, { where: { clientId: clientId } });
//         if (affectedCount <= 0) {
//             const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D3');
//             await message.reply({embeds: [errorEmbed], components: []});
//             return;
//         }
//     } else {
//         try {
//             await GAME_CREATE.create({
//                 clientId: clientId,
//                 status: 'roles',
//                 num_players: game_data['num_roles_max'],
//                 is_preset: false,
//                 sheriff: game_data['sheriff'],
//                 players_role: game_data['roles_list'],
//                 game_rule: game_data['game_rule']
//             })
//         }
//         catch (error) {
//             console.log(error);
//             const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D1');
//             await message.reply({embeds: [errorEmbed], components: []});
//             return;
//         }
//     }

//     const [ActionRowArr, rolesEmbed, timeoutEmbed]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
//         | [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder, EmbedBuilder]
//     = await ui_create_roles(clientId, time_sec, game_data['num_roles_max'], game_data['roles_list']);
//     const bot_reply: Message = await message.reply({ embeds: [rolesEmbed], components: ActionRowArr });
//     await timeout_set('create', bot_reply.id, clientId, message.channelId, time_sec, message_timeout, bot_reply);

//     async function message_timeout(bot_reply: Message): Promise<void> {
//         const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
//         if (game_create !== null) {
//             try {
//                 await GAME_CREATE.destroy({ where: { clientId: clientId } });
//             } catch (error) {
//                 console.error(error);
//                 const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
//                 await message.reply({embeds: [errorEmbed], components: []});
//                 return;
//             }
//         }
//         await bot_reply.edit({ embeds: [rolesEmbed, timeoutEmbed], components: [] });
//     }
// }


// async function create_roles(message: Message, clientId: string, time_sec: number, game_create: GameCreateInstance): Promise<void> {
//     const [ActionRowArr, rolesEmbed, timeoutEmbed]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
//         | [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder, EmbedBuilder]
//     = await ui_create_roles(clientId, time_sec, game_create.num_players as number, game_create.players_role as string[]);
//     const bot_reply: Message = await message.reply({ embeds: [rolesEmbed], components: ActionRowArr });
//     await timeout_set('create', bot_reply.id, clientId, message.channelId, time_sec, message_timeout, bot_reply);

//     async function message_timeout(bot_reply: Message): Promise<void> {
//         const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
//         if (game_create !== null) {
//             try {
//                 await GAME_CREATE.destroy({ where: { clientId: clientId } });
//             } catch (error) {
//                 console.error(error);
//                 const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
//                 await message.reply({embeds: [errorEmbed], components: []});
//                 return;
//             }
//         }
//         await bot_reply.edit({ embeds: [rolesEmbed, timeoutEmbed], components: [] });
//     }
// }


// async function create_final(message: Message, clientId: string, time_sec: number, game_create: GameCreateInstance): Promise<void> {
//     if (game_create.is_preset === null || game_create.num_players === null || game_create.game_rule === null
//         || game_create.sheriff === null || game_create.players_role === null) return;
//     const [ActionRowArr, finalEmbed, timeoutEmbed]: [[ActionRowBuilder<ButtonBuilder>], EmbedBuilder, EmbedBuilder]
//     = await ui_create_final(clientId, time_sec, {
//         "num_roles_max": game_create.num_players,
//         "sheriff": game_create.sheriff,
//         "game_rule": game_create.game_rule,
//         "roles_list": game_create.players_role
//     });
//     const bot_reply: Message = await message.reply({ embeds: [finalEmbed], components: ActionRowArr});
//     await timeout_set('create', bot_reply.id, clientId, message.channelId, time_sec, message_timeout, bot_reply);

//     async function message_timeout(update_msg: Message): Promise<void> {
//         const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
//         if (game_create !== null) {
//             try {
//                 await GAME_CREATE.destroy({ where: { clientId: clientId } });
//             } catch (error) {
//                 console.error(error);
//                 const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
//                 await message.reply({embeds: [errorEmbed], components: []});
//                 return;
//             }
//         }
//         await update_msg.edit({ embeds: [finalEmbed, timeoutEmbed], components: [] });
//     }
// }