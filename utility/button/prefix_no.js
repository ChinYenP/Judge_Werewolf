const { settings_prefix_timeout_delete, settings_prefix_is_message_author } = require('../timeout/settings_prefix_timeout.js');
const display_text = require('../../display_text.json');
const Sequelize = require('sequelize');
const db = require('../../sqlite_db.js');

async function button_prefix_no(interaction) {
    if (!(await settings_prefix_is_message_author(interaction.message.id, interaction.user.id))) {
        return;
    };

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings = await db.USER_SETTINGS.findOne({ where: { clientId: interaction.user.id } });

    let cancel_text = "";
    if (settings !== null) {
        //clientId exist
        switch(settings.lang) {
            case "eng":
                cancel_text = display_text.settings.server_settings.prefix.cancelation.eng;
                break;
            case "malay":
                cancel_text = display_text.settings.server_settings.prefix.cancelation.malay;
                break;
            case "schi":
                cancel_text = display_text.settings.server_settings.prefix.cancelation.schi;
                break;
            case "tchi":
                cancel_text = display_text.settings.server_settings.prefix.cancelation.tchi;
                break;
            case "yue":
                cancel_text = display_text.settings.server_settings.prefix.cancelation.yue;
                break;
            default:
                let error_msg = display_text.general.error.display.eng + display_text.general.error.error_code.select_menu;
                await message.reply(error_msg);
        };
    } else {
        //clientId not exist
        cancel_text = display_text.settings.server_settings.prefix.cancelation.eng;
    };

    await interaction.update({ content: cancel_text, components: []});
    await settings_prefix_timeout_delete(interaction.message.id, interaction.user.id, interaction.guildId)
};

module.exports = { button_prefix_no };