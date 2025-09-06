import { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';
import { get_display_text } from '../../../utility/get_display.js';
import { embed_hex_color, display_error_str } from '../../../global/config.js';
import { t_interaction_name } from '../../../global/types/list_str.js';

async function user_settings_action_row(clientId: string): Promise<ActionRowBuilder<StringSelectMenuBuilder>[]> {
        const [ lang_placeholder_text ]: string[] = await get_display_text(['settings.user_settings.lang_placeholder'], clientId);
    const rowLang: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_settings_user_lang' satisfies t_interaction_name)
                .setPlaceholder(lang_placeholder_text ?? display_error_str)
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
    return ([rowLang]);
}

async function ui_user_info_embed(clientId: string): Promise<EmbedBuilder> {
    const [ user_title_text, user_lang_title_text, user_lang_description_text ]: string[]
        = await get_display_text(['settings.embed.user_settings.title', 'settings.embed.user_settings.list.language.title',
            'settings.embed.user_settings.list.language.description'], clientId);
    const userEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(embed_hex_color)
        .setTitle(user_title_text ?? display_error_str)
        .addFields(
            {
                name: user_lang_title_text ?? display_error_str,
                value: user_lang_description_text ?? display_error_str
            }
        )
        .setTimestamp()
    return (userEmbed);
}

async function ui_server_info_embed(clientId: string): Promise<EmbedBuilder> {
    const allowed_symbol_text: string = process.env.ALLOWED_PREFIX_CHARACTERS;
    const [ server_title_text, server_description_text,
        server_prefix_title_text, server_prefix_description_text, ]: string[]
        = await get_display_text(['settings.embed.server_settings.title', 'settings.embed.server_settings.description',
            'settings.embed.server_settings.list.prefix.title', 'settings.embed.server_settings.list.prefix.description'], clientId);
    const serverEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(embed_hex_color)
        .setTitle(server_title_text ?? display_error_str)
        .setDescription(server_description_text ?? display_error_str)
        .addFields(
            {
                name: server_prefix_title_text ?? display_error_str,
                value: `${server_prefix_description_text ?? display_error_str}\n\`\`\`\n${allowed_symbol_text}\n\`\`\``
            }
        )
        .setTimestamp()

    return (serverEmbed);
}

export { ui_user_info_embed, ui_server_info_embed, user_settings_action_row }