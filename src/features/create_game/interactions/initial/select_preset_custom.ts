// import { StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, Message, InteractionCallbackResource, EmbedBuilder } from 'discord.js';
// import { GameCreateInstance, GAME_CREATE } from '../../../../global/sqlite_db.js';
// import { interaction_is_outdated, timeout_set, is_interaction_owner } from '../../../../utility/timeout/timeout.js';
// import { get_display_text } from '../../../utility/texts/get_display.js';
// import { config } from '../../../../global/config.js';
// import { ui_create_initial } from '../../embed/initial.js';
// import { ui_error_non_fatal, ui_error_fatal } from '../../../../utility/embed/error.js';
// uncheck
// async function select_create_initial_preset_custom(interaction: StringSelectMenuInteraction): Promise<void> {
    
//     const clientId: string = interaction.user.id;
//     const messageId: string = interaction.message.id;

//     if (await interaction_is_outdated(messageId)) {
//         const [outdated_interaction_text]: string[] = await get_display_text(['general.outdated_interaction'], clientId);
//         const outdated_embed: EmbedBuilder = await ui_error_non_fatal(clientId, outdated_interaction_text ?? config['display_error']);
//         await interaction.update({embeds: [outdated_embed], components: []});
//         return;
//     }
    
//     if (!(await is_interaction_owner(messageId, clientId))) {
//         return;
//     }

//     console.log('create_initial: select_preset_custom');

//     if (interaction.values[0] === undefined) return;
//     if (!(['preset', 'custom'].includes(interaction.values[0]))) return;

//     //Do sequelize thing here while get output text
//     let num_player_selected: number = -1;
//     let preset_selected: number = -1;
//     let game_rule_selected: number = -1;
//     let new_is_preset: boolean = true;
//     if (interaction.values[0] === 'preset') {
//         preset_selected = 1;
//     } else if (interaction.values[0] === 'custom') {
//         preset_selected = 0;
//         new_is_preset = false;
//     }
//     const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });

//     if (game_create !== null) {
//         //Update first
//         const [affectedCount] = await GAME_CREATE.update({ is_preset: new_is_preset }, { where: { clientId: clientId } });
//         if (affectedCount <= 0) {
//             const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D3');
//             await interaction.update({embeds: [errorEmbed], components: []});
//             return;
//         }
//         //Set default selection
//         if (game_create.num_players !== null) {
//             num_player_selected = game_create.num_players;
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
//                 is_preset: new_is_preset,
//                 sheriff: null,
//                 players_role: null,
//                 game_rule: null
//             })
//         }
//         catch (error) {
//             console.log(error);
//             const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D1');
//             await interaction.update({embeds: [errorEmbed], components: []});
//             return;
//         }
//     }

//     //Success
//     const time_sec: number = config['timeout_sec'].create.initial;
//     const [ActionRowArr, initialEmbed, timeoutEmbed]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>,
//                 ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder, EmbedBuilder]
//         = await ui_create_initial(clientId, time_sec, num_player_selected, preset_selected, game_rule_selected);
//     const update_msg_resource: InteractionCallbackResource = (await interaction.update({ embeds: [initialEmbed], components: ActionRowArr, withResponse: true })).resource as InteractionCallbackResource;
//     const update_msg: Message = update_msg_resource.message as Message;
//     await timeout_set('create', update_msg.id, clientId, update_msg.channelId, time_sec, message_timeout, update_msg);

//     async function message_timeout(update_msg: Message): Promise<void> {
//         const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
//         if (game_create !== null) {
//             try {
//                 await GAME_CREATE.destroy({ where: { clientId: clientId } });
//             } catch (error) {
//                 console.error(error);
//                 const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
//                 await update_msg.edit({embeds: [errorEmbed], components: []});
//                 return;
//             }
//         }
//         await update_msg.edit({ embeds: [initialEmbed, timeoutEmbed], components: [] });
//     }
// }

// export { select_create_initial_preset_custom }