const { settings_prefix_timeout_delete, settings_prefix_is_message_author, settings_get_prefix } = require('../../utility/timeout/settings_prefix_timeout.js');
const db = require('../../database/sqlite_db.js');
const { get_display_text, get_display_error_code } = require('../../utility/get_display.js');

async function button_prefix_yes(interaction) {

    if (!(await settings_prefix_is_message_author(interaction.message.id, interaction.user.id))) {
        return;
    };

    console.log("Button: prefix yes");

    let display_text = '';

    const prefix = await settings_get_prefix(interaction.guildId);

    const sqlite_status = await sequelize_prefix_yes(interaction, prefix);
    if (sqlite_status[0] === 0) {
        display_text = await get_display_error_code(sqlite_status[1], interaction.user.id);
        if (display_text.length !== 1) {
            console.error('DSPY error at ./interaction_elements/button/prefix_yes.js, no1');
            await interaction.message.edit({Content: 'Something has gone wrong during the code runtime: Error DSPY', Component: []});
            return;
        };
        console.error(`${sqlite_status[1]  } error at ./interaction_elements/button/prefix_yes.js, no2`);
        await interaction.message.edit({Content: display_text[0], Component: []});
        return;
    };

    //Success
    display_text = await get_display_text(['settings.server_settings.prefix.success'], interaction.user.id);
    if (display_text.length !== 1) {
        console.error('DSPY error at ./interaction_elements/button/prefix_yes.js, no3');
        await interaction.message.edit({Content: 'Something has gone wrong during the code runtime: Error DSPY', Component: []});
        return;
    };
    await interaction.message.edit({ content: display_text[0] + prefix, components: []});
    await settings_prefix_timeout_delete(interaction.message.id, interaction.user.id, interaction.guildId);
    
};


async function sequelize_prefix_yes(interaction, prefix) {

    /*
    [1] - success.
    [0, <str>] - error encountered, next element represents error code.
    */

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings = await db.SERVER_SETTINGS.findOne({ where: { guildId: interaction.guildId } });

    if (settings !== null) {
        //guildId exist, update data:
        // equivalent to: UPDATE SETTINGS (lang) values (?) WHERE clientId='?';
        const affectedRows = await db.SERVER_SETTINGS.update({ prefix: prefix }, { where: { guildId: interaction.guildId } });
        if (affectedRows > 0) {
            return [1];
        };
        return [0, 'D3'];
    };
    //clientId not exist, create new data:
    try {
        // equivalent to: INSERT INTO SETTINGS (clientId, lang, hardMode) values (?, ?, ?);
        await db.SERVER_SETTINGS.create({
            guildId: interaction.guildId,
            prefix: prefix,
        });
        return [1];
    }
    catch (error) {
        console.log(error);
        return [0, 'D1'];
    };
};

module.exports = { button_prefix_yes };