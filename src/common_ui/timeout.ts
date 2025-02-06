import { EmbedBuilder } from 'discord.js';
import { get_display_text } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';

async function ui_timeout(clientId: string, time_sec: number, timeout_text: string): Promise<EmbedBuilder> {
    const [ title_text ]: string[] = await get_display_text(['general.timeout_title'], clientId);

    const timeoutEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(config['embed_hex_color'])
        .setTitle(title_text ?? config['display_error'])
        .setDescription(`${timeout_text ?? config['display_error']}${String(time_sec)}s`)

    return (timeoutEmbed);
}

export { ui_timeout }