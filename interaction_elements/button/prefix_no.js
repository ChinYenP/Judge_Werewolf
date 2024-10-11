const { settings_prefix_timeout_delete, settings_prefix_is_message_author } = require('../../utility/timeout/settings_prefix_timeout.js');
const { get_display_text, get_display_error_code } = require('../../utility/get_display.js');

async function button_prefix_no(interaction) {
    if (!(await settings_prefix_is_message_author(interaction.message.id, interaction.user.id))) {
        return;
    };

    console.log("Button: prefix no");

    const display_arr = await get_display_text(['settings.server_settings.prefix.cancelation'], interaction.user.id);
    if (display_arr.length !== 1) {
        await interaction.reply(await get_display_error_code('S', interaction.user.id));
        console.error('S error at ./utility/button/prefix_no.js, no1');
        return;
    };

    await interaction.update({ content: display_arr[0], components: []});
    await settings_prefix_timeout_delete(interaction.message.id, interaction.user.id, interaction.guildId);
};

module.exports = { button_prefix_no };