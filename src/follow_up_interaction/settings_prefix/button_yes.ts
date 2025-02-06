import { interaction_is_outdated, timeout_delete, is_interaction_owner } from '../../utility/timeout.js';
import { get_display_text, get_display_error_code } from '../../utility/get_display.js';
import { ButtonInteraction } from 'discord.js';
import { config } from '../../text_data_config/config.js';
import { ServerSettingsInstance, SERVER_SETTINGS, TempPrefixSettingInstance, TEMP_PREFIX_SETTINGS } from '../../database/sqlite_db.js';

async function button_prefix_yes(interaction: ButtonInteraction): Promise<void> {

    if (await interaction_is_outdated(interaction.message.id)) {
        const outdated_interaction_text: string[] = await get_display_text(['general.outdated_interaction'], interaction.user.id);
        await interaction.update({ content: outdated_interaction_text[0] ?? config['display_error'], components: [] });
        return;
    }

    if (!(await is_interaction_owner(interaction.message.id, interaction.user.id))) {
        return;
    }
    if (interaction.guildId === null) return;

    console.log('settings_prefix: button_yes');

    //Get prefix. If it is false, the message is not from current session.
    const prefix_arr: [boolean, string] = await get_prefix(interaction.guildId);
    if (!prefix_arr[0]) {
        const outdated_interaction_text = await get_display_text(['general.outdated_interaction'], interaction.user.id);
        await interaction.update({ content: outdated_interaction_text[0] ?? config['display_error'], components: [] });
        return;
    }
    const prefix = prefix_arr[1];
    let display_arr: string[] = [];

    const sqlite_status: [number, string] | [number] = await sequelize_prefix_yes(interaction, prefix);
    if (sqlite_status[0] === 0) {
        console.error(`${sqlite_status[1]  } error at ./utility/settings_prefix/button_yes.js, no3`);
        await interaction.update({content: (await get_display_error_code(sqlite_status[1]!, interaction.user.id))[0] ?? config['display_error'], components: []});
        return;
    }

    //Success
    display_arr = await get_display_text(['settings.server_settings.prefix.success'], interaction.user.id);
    await interaction.update({ content: (display_arr[0] ?? config['display_error']) + prefix, components: [], embeds: []});
    await timeout_delete(interaction.message.id, interaction.user.id);
    
};

async function get_prefix(guildId: string): Promise<[boolean, string]> {
    const settings: TempPrefixSettingInstance | null = await TEMP_PREFIX_SETTINGS.findOne({where: { guildId: guildId }});
    if (settings !== null) {
        return ([true, settings.prefix]);
    }
    return ([false, '']);
}


async function sequelize_prefix_yes(interaction: ButtonInteraction, prefix: string): Promise<[number, string] | [number]> {

    /*
    [1] - success.
    [0, <str>] - error encountered, next element represents error code.
    */

    if (interaction.guildId === null) {
        console.log('message.guildId should exists: ./utility/settings_prefix/button_yes.js');
        return [0, 'U'];
    }

    const settings_Temp: TempPrefixSettingInstance | null = await TEMP_PREFIX_SETTINGS.findOne({ where: { guildId: interaction.guildId } });
    if (settings_Temp !== null) {
        try {
            await TEMP_PREFIX_SETTINGS.destroy({ where: { guildId: interaction.guildId } });
        } catch (error) {
            console.error(error);
            await interaction.update({content: (await get_display_error_code('D2', interaction.user.id)) ?? config['display_error'], components: []});
        }
    }

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings: ServerSettingsInstance | null = await SERVER_SETTINGS.findOne({ where: { guildId: interaction.guildId } });

    if (settings !== null) {
        //guildId exist, update data:
        // equivalent to: UPDATE SETTINGS (lang) values (?) WHERE clientId='?';
        const [affectedCount] = await SERVER_SETTINGS.update({ prefix: prefix }, { where: { guildId: interaction.guildId } });
        if (affectedCount > 0) {
            return [1];
        };
        return [0, 'D3'];
    };
    //clientId not exist, create new data:
    try {
        // equivalent to: INSERT INTO SETTINGS (clientId, lang, hardMode) values (?, ?, ?);
        await SERVER_SETTINGS.create({
            guildId: interaction.guildId,
            prefix: prefix,
        })
        return [1];
    }
    catch (error) {
        console.log(error);
        return [0, 'D1'];
    };
};

export { button_prefix_yes }