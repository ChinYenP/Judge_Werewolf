import { EmbedBuilder } from 'discord.js';
import { get_display_text } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';

async function ui_success(clientId: string, success_text: string): Promise<EmbedBuilder> {
    const [ title_text ]: string[] = await get_display_text(['general.success_title'], clientId);

    const successEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(config['embed_hex_color'])
        .setTitle(title_text ?? config['display_error'])
        .setDescription(success_text ?? config['display_error'])

    return (successEmbed);
}

export { ui_success }