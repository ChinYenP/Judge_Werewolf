import { EmbedBuilder } from 'discord.js';
import { get_display_text } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';

async function ui_cancel(clientId: string, cancel_text: string): Promise<EmbedBuilder> {
    const [ title_text ]: string[] = await get_display_text(['general.cancel_title'], clientId);

    const cancelEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(config['embed_hex_color'])
        .setTitle(title_text ?? config['display_error'])
        .setDescription(cancel_text ?? config['display_error'])

    return (cancelEmbed);
}

export { ui_cancel }