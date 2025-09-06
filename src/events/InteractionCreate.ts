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