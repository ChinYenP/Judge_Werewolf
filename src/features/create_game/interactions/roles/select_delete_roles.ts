// import { StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, Message, InteractionCallbackResource, EmbedBuilder } from 'discord.js';
// import { GameCreateInstance, GAME_CREATE } from '../../../../global/sqlite_db.js';
// import { interaction_is_outdated, timeout_set, is_interaction_owner } from '../../../../utility/timeout/timeout.js';
// import { get_display_text } from '../../../utility/texts/get_display.js';
// import { config } from '../../../../global/config.js';
// import { ui_create_roles } from '../../embed/roles.js';
// import { ui_error_non_fatal, ui_error_fatal } from '../../../../utility/embed/error.js';
// import { t_role_id } from '../../../../global/types/other_types.js';
// uncheck
// async function select_create_roles_delete_roles(interaction: StringSelectMenuInteraction): Promise<void> {
    
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

//     console.log('create_roles: select_werewolf');

//     if (interaction.values[0] === undefined) return;

//     //Do sequelize thing here while get output text
//     let game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });

//     if (game_create === null) {
//         const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D4');
//         await interaction.update({embeds: [errorEmbed], components: []});
//         return;
//     }

//     //Update first
//     if (game_create.players_role == null || game_create.num_players === null) return;
//     let new_players_role: string[] = game_create.players_role;
//     for (const index_to_remove of interaction.values) {
//         new_players_role[Number(index_to_remove)] = ''; // To be removed
//     }
//     new_players_role = new_players_role.filter(item => item !== '');
    
//     const [affectedCount] = await GAME_CREATE.update({ players_role: new_players_role as t_role_id[] }, { where: { clientId: clientId } });
//     if (affectedCount <= 0) {
//         const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D3');
//         await interaction.update({embeds: [errorEmbed], components: []});
//         return;
//     }
//     game_create = await GAME_CREATE.findOne({ where: { clientId: clientId } });
//     if (game_create === null) {
//         const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D4');
//         await interaction.update({embeds: [errorEmbed], components: []});
//         return;
//     }
//     if (game_create.players_role == null || game_create.num_players === null) return;


//     //Success
//     const time_sec: number = config['timeout_sec'].create.roles;
//     const [ActionRowArr, rolesEmbed, timeoutEmbed]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
//         | [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder, EmbedBuilder]
//     = await ui_create_roles(clientId, time_sec, game_create.num_players, game_create.players_role);
//     const update_msg_resource: InteractionCallbackResource = (await interaction.update({ embeds: [rolesEmbed], components: ActionRowArr, withResponse: true })).resource as InteractionCallbackResource;
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
//         await update_msg.edit({ embeds: [rolesEmbed, timeoutEmbed], components: [] });
//     }
// }

// export { select_create_roles_delete_roles }