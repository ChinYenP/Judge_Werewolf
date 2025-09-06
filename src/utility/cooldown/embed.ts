import { EmbedBuilder } from 'discord.js';
import { get_display_text } from '../get_display.js';
import { embed_hex_color, display_error_str } from '../../global/config.js';

async function ui_cooldown(clientId: string, time_sec: number): Promise<EmbedBuilder> {
    const [ title_text, description_text ]: string[]
        = await get_display_text(['general.cooldown.title', 'general.cooldown.description'], clientId);
    const cooldownEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(embed_hex_color)
        .setTitle(title_text ?? display_error_str)
        .setDescription(`${description_text ?? display_error_str}${String(time_sec)}s`)

    return (cooldownEmbed);
}

export { ui_cooldown }