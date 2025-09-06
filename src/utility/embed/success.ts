import { EmbedBuilder } from 'discord.js';
import { get_display_text } from '../get_display.js';
import { embed_hex_color, display_error_str } from '../../global/config.js';

async function ui_success(clientId: string, success_text: string): Promise<EmbedBuilder> {
    const [ title_text ]: string[] = await get_display_text(['general.success_title'], clientId);

    const successEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(embed_hex_color)
        .setTitle(title_text ?? display_error_str)
        .setDescription(success_text)

    return (successEmbed);
}

export { ui_success }