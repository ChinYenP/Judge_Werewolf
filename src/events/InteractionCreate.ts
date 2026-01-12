import { Events, Interaction } from 'discord.js';
import { EventModule } from '../global/types/module.js';
import { t_interaction_name, isInteractionName } from '../global/types/list_str.js';
import { AllSelectModules, AllButtonModules } from '../global/types/interaction_states.js';
import { get_display_text, get_display_error_code } from '../utility/get_display.js';
import { display_error_str } from '../global/config.js';

async function get_select_module(interaction_name: t_interaction_name): Promise<AllSelectModules | undefined> {
    switch (interaction_name) {
        case ('select_settings_user_lang'):
            return ((await import('../features/settings/user/select_lang.js')).default);
        case ('select_create_initial_game_rule'):
            return ((await import('../features/create_game/interactions/initial/select_game_rule.js')).default);
        case ('select_create_initial_preset_custom'):
            return ((await import('../features/create_game/interactions/initial/select_preset_custom.js')).default);
        case ('select_create_initial_num_player'):
            return ((await import('../features/create_game/interactions/initial/select_num_player.js')).default);
        case ('select_create_roles_werewolf'):
            return ((await import('../features/create_game/interactions/roles/select_add_role_werewolf.js')).default);
        case ('select_create_roles_village_team'):
            return ((await import('../features/create_game/interactions/roles/select_add_role_village.js')).default);
        case ('select_create_roles_delete_roles'):
            return ((await import('../features/create_game/interactions/roles/select_delete_roles.js')).default);
        default:
            return (undefined);
    }
}

async function get_button_module(interaction_name: t_interaction_name): Promise<AllButtonModules | undefined> {
    switch (interaction_name) {
        case ('button_settings_prefix_no'):
            return ((await import('../features/settings/prefix/button_no.js')).default);
        case ('button_settings_prefix_yes'):
            return ((await import('../features/settings/prefix/button_yes.js')).default);
        case ('button_create_cancel'):
            return ((await import('../features/create_game/interactions/button_cancel.js')).default);
        case ('button_create_initial_next'):
            return ((await import('../features/create_game/interactions/initial/button_next.js')).default);
        case ('button_create_roles_next'):
            return ((await import('../features/create_game/interactions/roles/button_next.js')).default);
        case ('button_create_final_start_game'):
            return ((await import('../features/create_game/interactions/final/button_start_game.js')).default);
        default:
            return (undefined);
    }
}

const interaction_create: EventModule<Interaction> = {
    event_name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction): Promise<void> {

        if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;
        if (!isInteractionName(interaction.customId)) return;

        const clientId: string = interaction.user.id;
        const interactionName: t_interaction_name = interaction.customId;

        if (interaction.isStringSelectMenu()) {

            const interact: AllSelectModules | undefined = await get_select_module(interactionName);
            if (!interact) {
                const [cmd_not_exist_text]: string[] = await get_display_text(['general.interaction_not_implemented'], clientId);
                await interaction.reply(`${cmd_not_exist_text ?? display_error_str}${interactionName}`);
                console.error(`Interaction matching ${interactionName} is not implemented yet.`);
                return;
            }
            try {
                await interact.entry(interaction);
            } catch (error) {
                await interaction.reply((await get_display_error_code('C2', clientId))[0] ?? display_error_str);
                console.error(error);
            }

        } else {
            
            const interact: AllButtonModules | undefined = await get_button_module(interactionName);
            if (!interact) {
                const [cmd_not_exist_text]: string[] = await get_display_text(['general.interaction_not_implemented'], clientId);
                await interaction.reply(`${cmd_not_exist_text ?? display_error_str}${interactionName}`);
                console.error(`Interaction matching ${interactionName} is not implemented yet.`);
                return;
            }
            try {
                await interact.entry(interaction);
            } catch (error) {
                await interaction.reply((await get_display_error_code('C2', clientId))[0] ?? display_error_str);
                console.error(error);
            }

        }

        
    }
}

export default interaction_create;