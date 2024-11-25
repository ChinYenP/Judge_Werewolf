const { Events } = require('discord.js');
const { check_cooldown } = require('../utility/cooldown.js');
const { prefix_validation } = require('../utility/validation/prefix_validation.js');
const { get_display_text, get_display_error_code } = require('../utility/get_display.js');
const db = require('../database/sqlite_db.js');
const config = require('../text_data_config/config.json');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {

        
    },
};