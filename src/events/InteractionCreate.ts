import { Events, Interaction } from 'discord.js';

import { menu_select_lang } from '../follow_up_interaction/settings_general/select_lang.js';
import { button_prefix_yes } from '../follow_up_interaction/settings_prefix/button_yes.js';
import { button_prefix_no } from '../follow_up_interaction/settings_prefix/button_no.js';

import { select_create_initial_num_player } from '../follow_up_interaction/create_initial/select_num_player.js';
import { select_create_initial_preset_custom } from '../follow_up_interaction/create_initial/select_preset_custom.js';
import { select_create_initial_game_rule } from '../follow_up_interaction/create_initial/select_game_rule.js';
import { button_create_initial_no } from '../follow_up_interaction/create_initial/button_cancel.js';
import { button_create_initial_next } from '../follow_up_interaction/create_initial/button_next.js';

export default {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction): Promise<void> {

        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'settings_user_lang') {
                await menu_select_lang(interaction);
            } else if (interaction.customId === 'create_initial_num_player') {
                await select_create_initial_num_player(interaction);
            } else if (interaction.customId === 'create_initial_preset_custom') {
                await select_create_initial_preset_custom(interaction);
            } else if (interaction.customId === 'create_initial_game_rule') {
                await select_create_initial_game_rule(interaction);
            }
        } else if (interaction.isButton()) {
            if (interaction.customId === 'settings_prefix_yes') {
                await button_prefix_yes(interaction);
            } else if (interaction.customId === 'settings_prefix_no') {
                await button_prefix_no(interaction);
            } else if (interaction.customId === 'create_cancel') {
                await button_create_initial_no(interaction);
            } else if (interaction.customId === 'create_initial_next') {
                await button_create_initial_next(interaction);
            }
        }
    }
}