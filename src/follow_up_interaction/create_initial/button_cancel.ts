import { general_timeout_delete, general_is_message_author } from '../../utility/timeout.js';
import { get_display_text, get_display_error_code } from '../../utility/get_display.js';
import { ButtonInteraction } from 'discord.js';
import { config } from '../../text_data_config/config.js';
import { GameCreateInstance, GAME_CREATE } from '../../database/sqlite_db.js';

async function button_create_initial_no(interaction: ButtonInteraction): Promise<void> {
    if (!(await general_is_message_author(interaction.message.id, interaction.user.id))) {
        return;
    }

    console.log('create_initial: button_cancel');

    if (interaction.guildId === null) return;
    const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: interaction.user.id } });
    if (settings !== null) {
        try {
            await GAME_CREATE.destroy({ where: { clientId: interaction.user.id } });
        } catch (error) {
            const display_arr: string[] = await get_display_error_code('D2', interaction.user.id);
            if (display_arr.length !== 1) {
                console.error('DSPY error at ./utility/create_initial/button_cancel.js, no2');
                await interaction.update({content: config['display_error'], components: []});
                return;
            }
            console.error(`D3 error at ./utility/create_initial/button_cancel.js, no3`);
            await interaction.update({content: display_arr[0] ?? config['display_error'], components: []});
            return;
        }
    }

    const display_arr: string[] = await get_display_text(['create.cancel'], interaction.user.id);
    if (display_arr.length !== 1) {
        await interaction.update((await get_display_error_code('S', interaction.user.id))[0] ?? config['display_error']);
        console.error('S error at ./utility/create_initial/button_cancel.js, no1');
        return;
    }

    await interaction.update({ content: display_arr[0] ?? config['display_error'], components: []});
    await general_timeout_delete(interaction.message.id, interaction.user.id);
}

export { button_create_initial_no }