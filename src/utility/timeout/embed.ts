import { EmbedBuilder } from 'discord.js';
import { get_display_text } from '../get_display.js';
import { embed_hex_color, display_error_str } from '../../global/config.js';

async function ui_timeout(clientId: string, time_sec: number, timeout_text: string): Promise<EmbedBuilder> {
    const [ title_text ]: string[] = await get_display_text(['general.timeout_title'], clientId);

    const timeoutEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(embed_hex_color)
        .setTitle(title_text ?? display_error_str)
        .setDescription(`${timeout_text}${String(time_sec)}s`)

    return (timeoutEmbed);
}

export { ui_timeout }