import { interaction_is_outdated, timeout_delete, is_interaction_owner } from '../../utility/timeout.js';
import { get_display_text, get_display_error_code } from '../../utility/get_display.js';
import { ButtonInteraction } from 'discord.js';
import { config } from '../../text_data_config/config.js';
import { GameCreateInstance, GAME_CREATE } from '../../database/sqlite_db.js';

async function button_create_initial_no(interaction: ButtonInteraction): Promise<void> {
    if (!(await is_interaction_owner(interaction.message.id, interaction.user.id))) {
        return;
    }

    console.log('create_initial: button_cancel');

    if (await interaction_is_outdated(interaction.message.id)) {
        const outdated_interaction_text: string[] = await get_display_text(['general.outdated_interaction'], interaction.user.id);
        await interaction.update({ content: outdated_interaction_text[0] ?? config['display_error'], components: [] });
        return;
    }

    if (interaction.guildId === null) return;
    const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: interaction.user.id } });
    if (settings !== null) {
        try {
            await GAME_CREATE.destroy({ where: { clientId: interaction.user.id } });
        } catch (error) {
            console.error(error);
            await interaction.update({content: (await get_display_error_code('D2', interaction.user.id)) ?? config['display_error'], components: []});
            return;
        }
    }

    const display_arr: string[] = await get_display_text(['create.cancel'], interaction.user.id);
    await interaction.update({ content: display_arr[0] ?? config['display_error'], components: []});
    await timeout_delete(interaction.message.id, interaction.user.id);
}

export { button_create_initial_no }