// import { interaction_is_outdated, timeout_delete, is_interaction_owner } from '../../../utility/timeout/timeout.js';
// import { get_display_text } from '../../utility/texts/get_display.js';
// import { ButtonInteraction, EmbedBuilder } from 'discord.js';
// import { config } from '../../../global/config.js';
// import { GameCreateInstance, GAME_CREATE } from '../../../global/sqlite_db.js';
// import { ui_cancel } from '../../../utility/embed/cancel.js';
// import { ui_error_non_fatal, ui_error_fatal } from '../../../utility/embed/error.js';
// uncheck
// async function button_create_initial_no(interaction: ButtonInteraction): Promise<void> {

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

//     console.log('create_initial: button_cancel');

//     if (interaction.guildId === null) return;
//     const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
//     if (game_create !== null) {
//         try {
//             await GAME_CREATE.destroy({ where: { clientId: clientId } });
//         } catch (error) {
//             console.error(error);
//             const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
//             await interaction.update({embeds: [errorEmbed], components: []});
//             return;
//         }
//     }

//     const [cancel_text]: string[] = await get_display_text(['create.cancel'], clientId);
//     const cancelEmbed: EmbedBuilder = await ui_cancel(clientId, cancel_text ?? config['display_error']);
//     await interaction.update({ embeds: [cancelEmbed], components: []});
//     await timeout_delete(messageId, clientId);
// }

// export { button_create_initial_no }