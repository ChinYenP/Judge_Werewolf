const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const display_text = require('../../display_text.json');
const db = require('../../sqlite_db.js');
const { settings_general_timeout_set, settings_general_is_message_author } = require('../timeout/settings_general_timeout.js');

async function menu_select_lang(interaction) {
    
    if (!(await settings_general_is_message_author(interaction.message.id, interaction.user.id))) {
        return;
    };

    //Do sequelize thing here while get output text
    const sqlite_status = await sequelize_select_lang(interaction, interaction.values[0]);

    const Content = '';
    switch (sqlite_status) {
        case 'err modify data':

            switch (interaction.user.id) {
                case 'eng':
                    confirm_msg = display_text.general.error.display.eng + display_text.general.error.error_code.database.modify_data;
                    break;
                case 'malay':
                    confirm_msg = display_text.general.error.display.malay + display_text.general.error.error_code.database.modify_data;
                    break;
                case 'schi':
                    confirm_msg = display_text.general.error.display.schi + display_text.general.error.error_code.database.modify_data;
                    break;
                case 'tchi':
                    confirm_msg = display_text.general.error.display.tchi + display_text.general.error.error_code.database.modify_data;
                    break;
                case 'yue':
                    confirm_msg = display_text.general.error.display.yue + display_text.general.error.error_code.database.modify_data;
                    break;
                default:
                    confirm_msg = display_text.general.error.display.eng + display_text.general.error.error_code.select_menu;
            };
            interaction.message.edit({ content: Content, components: [] });
            break;

        case 'err insert data':

            let confirm_msg = '';
            switch (interaction.user.id) {
                case 'eng':
                    confirm_msg = display_text.general.error.display.eng + display_text.general.error.error_code.database.insert_data;
                    break;
                case 'malay':
                    confirm_msg = display_text.general.error.display.malay + display_text.general.error.error_code.database.insert_data;
                    break;
                case 'schi':
                    confirm_msg = display_text.general.error.display.schi + display_text.general.error.error_code.database.insert_data;
                    break;
                case 'tchi':
                    confirm_msg = display_text.general.error.display.tchi + display_text.general.error.error_code.database.insert_data;
                    break;
                case 'yue':
                    confirm_msg = display_text.general.error.display.yue + display_text.general.error.error_code.database.insert_data;
                    break;
                default:
                    confirm_msg = display_text.general.error.display.eng + display_text.general.error.error_code.select_menu;
            };
            interaction.message.edit({ content: confirm_msg, components: [] });
            break;

        case 'success':
            success_display(interaction);
            break;
    };
};


async function sequelize_select_lang(interaction, value) {


    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings = await db.USER_SETTINGS.findOne({ where: { clientId: interaction.user.id } });

    if (settings !== null) {
        //clientId exist, update data:
        // equivalent to: UPDATE SETTINGS (lang) values (?) WHERE clientId='?';
        const affectedRows = await db.USER_SETTINGS.update({ lang: value }, { where: { clientId: interaction.user.id } });
        if (affectedRows > 0) {
            return 'success';
        };
        return 'err modify data';
    };
    //clientId not exist, create new data:
    try {
        // equivalent to: INSERT INTO SETTINGS (clientId, lang, hardMode) values (?, ?, ?);
        await db.USER_SETTINGS.create({
            clientId: interaction.user.id,
            lang: value,
        });
        return 'success';
    }
    catch (error) {
        console.log(error);
        return 'err insert data';
    };
};


async function success_display(interaction) {

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings = await db.USER_SETTINGS.findOne({ where: { clientId: interaction.user.id } });


    let user_text = '';
    let server_text = '';
    let placeholder_text = '';
    let timeout_text = '';
    const time_sec = display_text.general.timeout_sec.settings.general;
    const allowed_symbol_text = process.env.ALLOWED_PREFIX_CHARACTERS;
    if (settings !== null) {
        //clientId exist
        switch (settings.lang) {
            case 'eng':
                user_text = `${display_text.settings.user_settings.eng}`;
                server_text = `${display_text.settings.server_settings.eng}${allowed_symbol_text}`;
                placeholder_text = display_text.settings.user_settings.placeholder_text.lang.eng;
                timeout_text = `${display_text.settings.timeout.eng + time_sec  }s`;
                break;
            case 'malay':
                user_text = `${display_text.settings.user_settings.malay}`;
                server_text = `${display_text.settings.server_settings.malay}${allowed_symbol_text}`;
                placeholder_text = display_text.settings.user_settings.placeholder_text.lang.malay;
                timeout_text = `${display_text.settings.timeout.malay + time_sec  }s`;
                break;
            case 'schi':
                user_text = `${display_text.settings.user_settings.schi}`;
                server_text = `${display_text.settings.server_settings.schi}${allowed_symbol_text}`;
                placeholder_text = display_text.settings.user_settings.placeholder_text.lang.schi;
                timeout_text = `${display_text.settings.timeout.schi + time_sec  }s`;
                break;
            case 'tchi':
                user_text = `${display_text.settings.user_settings.tchi}`;
                server_text = `${display_text.settings.server_settings.tchi}${allowed_symbol_text}`;
                placeholder_text = display_text.settings.user_settings.placeholder_text.lang.tchi;
                timeout_text = `${display_text.settings.timeout.tchi + time_sec  }s`;
                break;
            case 'yue':
                user_text = `${display_text.settings.user_settings.yue}`;
                server_text = `${display_text.settings.server_settings.yue}${allowed_symbol_text}`;
                placeholder_text = display_text.settings.user_settings.placeholder_text.lang.yue;
                timeout_text = `${display_text.settings.timeout.yue + time_sec  }s`;
                break;
            default:
                const error_msg = display_text.general.error.display.eng + display_text.general.error.error_code.select_menu;
                await interaction.reply(error_msg);
        };
    } else {
        //clientId not exist
        user_text = `${display_text.settings.user_settings.eng}`;
        server_text = `${display_text.settings.server_settings.eng}${allowed_symbol_text}`;
        placeholder_text = display_text.settings.user_settings.placeholder_text.lang.default;
        timeout_text = `${display_text.settings.timeout.eng + time_sec  }s`;
    };

    const rowLang = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select lang')
                .setPlaceholder(placeholder_text)
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
                ),
        );

    const Content = `${user_text  }\n\n${  server_text}`;
    
    const update_msg = await interaction.update({ content: Content, components: [rowLang], fetchReply: true });
    settings_general_timeout_set(update_msg.id, interaction.user.id, interaction.channelId, time_sec, interaction_timeout, update_msg);

    async function interaction_timeout(update_msg) {
        const timeout_content = `${user_text  }\n\n${  server_text  }\n\n${  timeout_text}`;
        await update_msg.edit({ content: timeout_content, components: [] });
    };
};


module.exports = { menu_select_lang };