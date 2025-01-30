import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { get_display_text } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';

async function ui_user_settings(clientId: string, time_sec: number): Promise<[ActionRowBuilder<StringSelectMenuBuilder>, string, string]> {
    const allowed_symbol_text: string = process.env.ALLOWED_PREFIX_CHARACTERS;
    const display_arr: string[] = await get_display_text(['settings.user_settings', 'settings.server_settings', 'settings.user_settings.placeholder_text.lang', 'settings.timeout'], clientId);
    const rowLang: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('settings_user_lang')
                .setPlaceholder(display_arr[2] ?? config['display_error'])
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
    
    const Content: string = `${display_arr[0] ?? config['display_error']}\n\n${(display_arr[1] ?? config['display_error']) + allowed_symbol_text}`;
    const timeout_content: string = `${display_arr[0] ?? config['display_error']}\n\n${(display_arr[1] ?? config['display_error']) + allowed_symbol_text}\n\n${(display_arr[3] ?? config['display_error']) + time_sec.toString()}s`;
    return ([rowLang, Content, timeout_content]);
}

export { ui_user_settings }