import { EmbedBuilder } from 'discord.js';
import { get_display_text } from '../get_display.js';
import { embed_hex_color, display_error_str } from '../../global/config.js';

async function ui_invalid_game_id(clientId: string, game_id: string, error_msg: string): Promise<EmbedBuilder> {
    const [title_text, description_text]: string[]
        = await get_display_text(['game_id.invalid_embed.title', 'game_id.common_description'], clientId);

    const invalidEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(embed_hex_color)
        .setTitle(title_text ?? display_error_str)
        .setDescription(`${error_msg}\n${description_text}\`${game_id}\``)
        .setTimestamp()
    
    return (invalidEmbed);
}

export { ui_invalid_game_id }