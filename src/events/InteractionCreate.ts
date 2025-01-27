import { Events, Interaction } from 'discord.js';

import { menu_select_lang } from '../interaction_elements/select menu/select_lang.js';
import { button_prefix_yes } from '../interaction_elements/button/prefix_yes.js';
import { button_prefix_no } from '../interaction_elements/button/prefix_no.js';

export default {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction): Promise<void> {

        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'settings_user_lang') {
                await menu_select_lang(interaction);
            };
        } else if (interaction.isButton()) {
            if (interaction.customId === 'settings_prefix_yes') {
                await button_prefix_yes(interaction);
            } else if (interaction.customId === 'settings_prefix_no') {
                await button_prefix_no(interaction);
            };
        };
    
    },
};