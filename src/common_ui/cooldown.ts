import { EmbedBuilder } from 'discord.js';
import { get_display_text } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';

async function ui_cooldown(clientId: string, time_sec: number): Promise<EmbedBuilder> {
    const [ title_text, description_text ]: string[]
        = await get_display_text(['general.cooldown.title', 'general.cooldown.description'], clientId);
    const cooldownEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(config['embed_hex_color'])
        .setTitle(title_text ?? config['display_error'])
        .setDescription(`${description_text ?? config['display_error']}${String(time_sec)}s`)

    return (cooldownEmbed);
}

export { ui_cooldown }