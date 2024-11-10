const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'settings_user_lang') {
                const { menu_select_lang } = require('../interaction_elements/select menu/select_lang.js');
                await menu_select_lang(interaction);
            };
        } else if (interaction.isButton()) {
            if (interaction.customId === 'settings_prefix_yes') {
                const { button_prefix_yes } = require('../interaction_elements/button/prefix_yes.js');
                await button_prefix_yes(interaction);
            } else if (interaction.customId === 'settings_prefix_no') {
                const { button_prefix_no } = require('../interaction_elements/button/prefix_no.js');
                await button_prefix_no(interaction);
            };
        };
    
    },
};