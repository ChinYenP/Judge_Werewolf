const { settings_prefix_timeout_delete, settings_prefix_is_message_author, settings_get_prefix } = require('../timeout/settings_prefix_timeout.js');
const display_text = require('../../display_text.json');
const Sequelize = require('sequelize');
const db = require('../../sqlite_db.js');

async function button_prefix_yes(interaction) {

    if (!(await settings_prefix_is_message_author(interaction.message.id, interaction.user.id))) {
        return;
    };

    let prefix = await settings_get_prefix(interaction.guildId);

    //Do sequelize thing here while get output text
	const sqlite_status = await sequelize_prefix_yes(interaction, prefix);

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const user_settings = await db.USER_SETTINGS.findOne({ where: { clientId: interaction.user.id } });

    let language = "";
    if (user_settings !== null) {
        //clientId exist
        switch(user_settings.lang) {
            case "eng":
                language = "eng";
                break;
            case "malay":
                language = "malay";
                break;
            case "schi":
                language = "schi";
                break;
            case "tchi":
                language = "tchi";
                break;
            case "yue":
                language = "yue";
                break;
            default:
                let error_msg = display_text.general.error.display.eng + display_text.general.error.error_code.select_menu;
                await message.reply(error_msg);
        };
    } else {
        //clientId not exist
        language = "eng";
    };

    let Content = '';
    switch (sqlite_status) {
        case 'err modify data':

            switch (language) {
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
            interaction.message.edit({ content: Content, components: [] })
            break;

        case 'err insert data':

        switch (language) {
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
        interaction.message.edit({ content: Content, components: [] })
        break;

        case 'success':
            success_display(interaction, language, prefix);
            break;
    };
};



async function sequelize_prefix_yes(interaction, prefix) {


    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings = await db.SERVER_SETTINGS.findOne({ where: { guildId: interaction.guildId } });

    if (settings !== null) {
        //guildId exist, update data:
        // equivalent to: UPDATE SETTINGS (lang) values (?) WHERE clientId='?';
        const affectedRows = await db.SERVER_SETTINGS.update({ prefix: prefix }, { where: { guildId: interaction.guildId } });
        if (affectedRows > 0) {
            return "success";
        };
        return "err modify data";
    };
    //clientId not exist, create new data:
    try {
        // equivalent to: INSERT INTO SETTINGS (clientId, lang, hardMode) values (?, ?, ?);
        const settings = await db.SERVER_SETTINGS.create({
            guildId: interaction.guildId,
            prefix: prefix,
        });
        return "success";
    }
    catch (error) {
        console.log(error);
        return "err insert data";
    };
};


async function success_display(interaction, language, prefix) {
    let success_msg = "";
    switch (language) {
        case 'eng':
            success_msg = display_text.settings.server_settings.prefix.success.eng + prefix;
            break;
        case 'malay':
            success_msg = display_text.settings.server_settings.prefix.success.malay + prefix;
            break;
        case 'schi':
            success_msg = display_text.settings.server_settings.prefix.success.schi + prefix;
            break;
        case 'tchi':
            success_msg = display_text.settings.server_settings.prefix.success.tchi + prefix;
            break;
        case 'yue':
            success_msg = display_text.settings.server_settings.prefix.success.yue + prefix;
            break;
        default:
            success_msg = display_text.settings.server_settings.prefix.success.eng + prefix;
    };

    await interaction.update({ content: success_msg, components: []});
    await settings_prefix_timeout_delete(interaction.message.id, interaction.user.id, interaction.guildId)
};

module.exports = { button_prefix_yes };