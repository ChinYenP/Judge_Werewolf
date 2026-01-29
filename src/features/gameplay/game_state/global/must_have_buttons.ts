import { ButtonBuilder, ButtonStyle } from "discord.js";
import { display_error_str } from "../../../../global/config.js";
import { t_interaction_name } from "../../../../global/types/list_str.js";
import { get_display_text } from "../../../../utility/get_display.js";


export async function must_have_buttons(clientId: string): Promise<{ cancel_button: ButtonBuilder; guess_button: ButtonBuilder }> {
    
    const [guess_text, cancel_text]: string[]
        = await get_display_text(['gameplay.guess_button', 'gameplay.cancel_button'], clientId);
    
    const cancel_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('button_gameplay_cancel' satisfies t_interaction_name)
        .setLabel(cancel_text ?? display_error_str)
        .setStyle(ButtonStyle.Danger)
    
    const guess_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('button_gameplay_guess' satisfies t_interaction_name)
        .setLabel(guess_text ?? display_error_str)
        .setStyle(ButtonStyle.Danger)
    return ({cancel_button: cancel_button, guess_button: guess_button});
}