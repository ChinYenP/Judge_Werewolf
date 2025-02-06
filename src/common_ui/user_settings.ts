import { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';
import { get_display_text } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';
import { ui_timeout } from './timeout.js';

async function ui_user_settings(clientId: string, time_sec: number): Promise<[ActionRowBuilder<StringSelectMenuBuilder>, EmbedBuilder, EmbedBuilder, EmbedBuilder]> {
    const allowed_symbol_text: string = process.env.ALLOWED_PREFIX_CHARACTERS;
    const [ user_title_text, user_lang_title_text, user_lang_description_text, server_title_text, server_description_text,
        server_prefix_title_text, server_prefix_description_text, timeout_text, lang_placeholder_text ]: string[]
        = await get_display_text(['settings.embed.user_settings.title', 'settings.embed.user_settings.list.language.title',
            'settings.embed.user_settings.list.language.description', 'settings.embed.server_settings.title', 'settings.embed.server_settings.description',
            'settings.embed.server_settings.list.prefix.title', 'settings.embed.server_settings.list.prefix.description',
            'settings.embed.timeout_text', 'settings.user_settings.lang_placeholder'], clientId);
    const rowLang: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('settings_user_lang')
                .setPlaceholder(lang_placeholder_text ?? config['display_error'])
                .addOptions(
                    {
                        label: 'English',
                        description: 'English',
                        value: 'eng',
                    },
                    {
                        label: 'Bahasa Melayu',
                        description: 'Malay',
                        value: 'malay'
                    },
                    {
                        label: '简体中文',
                        description: 'Simplified Chinese',
                        value: 'schi',
                    },
                    {
                        label: '繁體中文',
                        description: 'Traditional Chinese',
                        value: 'tchi',
                    },
                    {
                        label: '粵語',
                        description: 'Cantonese',
                        value: 'yue',
                    }
                )
        )
    
    const userEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(config['embed_hex_color'])
        .setTitle(user_title_text ?? config['display_error'])
        .addFields(
            {
                name: user_lang_title_text ?? config['display_error'],
                value: user_lang_description_text ?? config['display_error']
            }
        )
        .setTimestamp()
    const serverEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(config['embed_hex_color'])
        .setTitle(server_title_text ?? config['display_error'])
        .setDescription(server_description_text ?? config['display_error'])
        .addFields(
            {
                name: server_prefix_title_text ?? config['display_error'],
                value: `${server_prefix_description_text ?? config['display_error']}\n\`\`\`\n${allowed_symbol_text}\n\`\`\``
            }
        )
        .setTimestamp()

    return ([rowLang, userEmbed, serverEmbed, (await ui_timeout(clientId, time_sec, timeout_text ?? config['display_error']))]);
}

export { ui_user_settings }