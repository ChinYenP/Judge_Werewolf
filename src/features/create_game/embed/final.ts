// import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
// import { get_display_text, get_game_id } from '../../../utility/get_display.js';
// import { config } from '../../../global/config.js';
// import { t_role_id } from '../../../global/types/other_types.js';
// import { ui_timeout } from '../../../utility/timeout/embed.js';
// import { ui_game_id } from '../../../utility/embed/game_id.js';
// uncheck
// async function ui_create_final(clientId: string, time_sec: number, data: {
//     'num_roles_max': number,
//     'sheriff': boolean,
//     'game_rule': t_game_rule,
//     'roles_list': t_role_id[]})
// : Promise<[[ActionRowBuilder<ButtonBuilder>], EmbedBuilder, EmbedBuilder]> {

//     const [title_text, description_text, timeout_text, button_start_game_text, button_cancel_text, game_id_description]: string[]
//         = await get_display_text(['create.final.embed.title', 'create.final.embed.description',
//             'create.timeout', 'create.final.button_start_game', 'create.button_cancel',
//             'game_id.common_description'
//         ], clientId);

//         const game_id: string = await get_game_id(data);
//     const finalEmbed: EmbedBuilder = await ui_game_id(clientId, title_text ?? config['display_error'], `${description_text}\n${game_id_description}\`${game_id}\``, data);
    
//     const start_game_button: ButtonBuilder = new ButtonBuilder()
//         .setCustomId('create_final_start_game' satisfies t_interaction_name)
//         .setLabel(button_start_game_text ?? config['display_error'])
//         .setStyle(ButtonStyle.Success)

//     const cancel_button: ButtonBuilder = new ButtonBuilder()
//         .setCustomId('create_cancel' satisfies t_interaction_name)
//         .setLabel(button_cancel_text ?? config['display_error'])
//         .setStyle(ButtonStyle.Secondary);
        
//     const rowButton: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
//         .addComponents(cancel_button, start_game_button);

//     return ([[rowButton], finalEmbed, (await ui_timeout(clientId, time_sec, timeout_text ?? config['display_error']))]);
// }

// export { ui_create_final }