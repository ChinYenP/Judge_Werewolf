import { EmbedBuilder } from 'discord.js';
import { get_display_text } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';

async function ui_invalid_game_id(clientId: string, game_id: string): Promise<EmbedBuilder> {
    const [title_text, description_text]: string[]
        = await get_display_text(['game_id.invalid_embed.title', 'game_id.common_description'], clientId);

    const invalidEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(config['embed_hex_color'])
        .setTitle(title_text ?? config['display_error'])
        .setDescription(`${description_text}\`${game_id}\``)
        .setTimestamp()
    
    return (invalidEmbed);
}

export { ui_invalid_game_id }