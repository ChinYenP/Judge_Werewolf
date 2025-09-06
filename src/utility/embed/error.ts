import { EmbedBuilder } from 'discord.js';
import { get_display_text } from '../get_display.js';
import { embed_hex_color, display_error_str } from '../../global/config.js';
import { t_error_code } from '../../global/types/list_str.js';

async function ui_error_non_fatal(clientId: string, error_text: string): Promise<EmbedBuilder> {
    const [ title_text ]: string[] = await get_display_text(['general.error.title'], clientId);

    const errorEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(embed_hex_color)
        .setTitle(title_text ?? display_error_str)
        .setDescription(error_text)

    return (errorEmbed);
}

async function ui_error_fatal(clientId: string, error_code: t_error_code): Promise<EmbedBuilder> {
    const [ title_text, description_text ]: string[]
        = await get_display_text(['general.error.title', 'general.error.description'], clientId);

    const errorEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(embed_hex_color)
        .setTitle(title_text ?? display_error_str)
        .setDescription(`${description_text ?? display_error_str}${error_code}`)

    return (errorEmbed);
}

export { ui_error_non_fatal, ui_error_fatal }