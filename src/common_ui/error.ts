import { EmbedBuilder } from 'discord.js';
import { get_display_text } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';

async function ui_error_non_fatal(clientId: string, error_text: string): Promise<EmbedBuilder> {
    const [ title_text ]: string[] = await get_display_text(['general.error.title'], clientId);

    const errorEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(config['embed_hex_color'])
        .setTitle(title_text ?? config['display_error'])
        .setDescription(error_text)

    return (errorEmbed);
}

async function ui_error_fatal(clientId: string, error_code: string): Promise<EmbedBuilder> {
    const [ title_text, description_text ]: string[]
        = await get_display_text(['general.error.title', 'general.error.description'], clientId);

    const errorEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(config['embed_hex_color'])
        .setTitle(title_text ?? config['display_error'])
        .setDescription(`${description_text ?? config['display_error']}${error_code}`)

    return (errorEmbed);
}

export { ui_error_non_fatal, ui_error_fatal }