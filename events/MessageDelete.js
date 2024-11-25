const { Events } = require('discord.js');
const { general_is_outdated, timeouts_message_get_clientId, general_timeout_delete } = require('../utility/timeout/general_timeout.js');
const { settings_prefix_timeout_has_messageId, settings_prefix_timeouts_message_get_clientId, settings_prefix_timeout_delete } = require('../utility/timeout/settings_prefix_timeout.js');
const { get_display_text, get_display_error_code } = require('../utility/get_display.js');
const db = require('../database/sqlite_db.js');
const config = require('../text_data_config/config.json');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (message.author.id === message.client.user.id) {
            if (!(await general_is_outdated(message.id))) {
                await general_timeout_delete(message.id, await timeouts_message_get_clientId(message.id));
                await message.channel.send("Test: delete message solved.");
            } else if (await settings_prefix_timeout_has_messageId(message.id)) {
                await settings_prefix_timeout_delete(message.id, await settings_prefix_timeouts_message_get_clientId(message.id));
                await message.channel.send("Test: delete message prefix solved.");
            };
        };        
    },
};