const { ActionRowBuilder, StringSelectMenuBuilder, Events } = require('discord.js');
//const { data } = require('../commands/settings.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        if (interaction.isStringSelectMenu()) {
			if (interaction.customId === 'select lang') {
				const { menu_select_lang } = require('../utility/select menu/select_lang.js');
				await menu_select_lang(interaction);
			};
		} else if (interaction.isButton()) {
			if(interaction.customId === 'settings_prefix_yes') {
				const { button_prefix_yes } = require('../utility/button/prefix_yes.js');
				await button_prefix_yes(interaction);
			} else if(interaction.customId === 'settings_prefix_no') {
				const { button_prefix_no } = require('../utility/button/prefix_no.js');
				await button_prefix_no(interaction);
			};
		} else if (interaction.isModalSubmit()) {
			if (interaction.customId === 's_prefix_confirm_modelId') {
				
			};
		};
    
    },
};