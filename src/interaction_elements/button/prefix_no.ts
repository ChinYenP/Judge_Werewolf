import { general_timeout_delete, general_is_message_author } from '../../utility/timeout/general_timeout.js';
import { get_display_text, get_display_error_code } from '../../utility/get_display.js';
import { ButtonInteraction } from 'discord.js';
import { config } from '../../text_data_config/config.js';
import {TempPrefixSettingInstance, TEMP_PREFIX_SETTINGS} from '../../database/sqlite_db.js';

async function button_prefix_no(interaction: ButtonInteraction): Promise<void> {
    if (!(await general_is_message_author(interaction.message.id, interaction.user.id))) {
        return;
    }

    console.log('Button: prefix no');

    if (interaction.guildId === null) return;
    const settings: TempPrefixSettingInstance | null = await TEMP_PREFIX_SETTINGS.findOne({ where: { guildId: interaction.guildId } });
    if (settings !== null) {
        try {
            await TEMP_PREFIX_SETTINGS.destroy({ where: { guildId: interaction.guildId } });
        } catch (error) {
            const display_arr: string[] = await get_display_error_code('D2', interaction.user.id);
            if (display_arr.length !== 1) {
                console.error('DSPY error at ./utility/button/prefix_no.js, no2');
                await interaction.update({content: config['display_error'], components: []});
                return;
            }
            console.error(`D3 error at ./utility/button/prefix_no.js, no3`);
            await interaction.update({content: display_arr[0] ?? config['display_error'], components: []});
            return;
        }
    }

    const display_arr: string[] = await get_display_text(['settings.server_settings.prefix.cancelation'], interaction.user.id);
    if (display_arr.length !== 1) {
        await interaction.update((await get_display_error_code('S', interaction.user.id))[0] ?? config['display_error']);
        console.error('S error at ./utility/button/prefix_no.js, no1');
        return;
    }

    await interaction.update({ content: display_arr[0] ?? config['display_error'], components: []});
    await general_timeout_delete(interaction.message.id, interaction.user.id);
}

export { button_prefix_no }