import { is_valid_interaction, timeout_delete } from '../../../utility/timeout/timeout.js';
import { get_display_text } from '../../../utility/get_display.js';
import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { display_error_str } from '../../../global/config.js';
import { ServerSettingsInstance, SERVER_SETTINGS, TempPrefixSettingInstance, TEMP_PREFIX_SETTINGS } from '../../../global/sqlite_db.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../../utility/embed/error.js';
import { ui_success } from '../../../utility/embed/success.js';
import { InteractionModule } from '../../../global/types/module.js';
import { buttonPrefixYesStates } from '../../../global/types/interaction_states.js';


const button_yes_interaction: InteractionModule<ButtonInteraction, buttonPrefixYesStates> = {
    interaction_name: 'button_settings_prefix_yes',
    states: {
        prefix_yes: {
            execute: async function (interaction: ButtonInteraction): Promise<void> {
                const clientId: string = interaction.user.id;
                const messageId: string = interaction.message.id;

                if (interaction.guildId === null) {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                };
                
                //Get prefix. If it is false, the message is not from current session.
                const settings: TempPrefixSettingInstance | null = await TEMP_PREFIX_SETTINGS.findOne({where: { guildId: interaction.guildId }});
                if (settings === null) {
                    const [outdated_interaction_text]: string[] = await get_display_text(['general.outdated_interaction'], clientId);
                    const outdated_embed: EmbedBuilder = await ui_error_non_fatal(clientId, outdated_interaction_text ?? display_error_str);
                    await interaction.update({embeds: [outdated_embed], components: []});
                    return;
                }
                const prefix: string = settings.prefix;

                const sqlite_status: boolean = await sequelize_prefix_yes(interaction, prefix, clientId);
                if (!sqlite_status) {
                    return;
                }

                //Success
                const [success_text]: string[] = await get_display_text(['settings.server_settings.prefix.success'], clientId);
                const successEmbed: EmbedBuilder = await ui_success(clientId, `${success_text ?? display_error_str}${prefix}`);
                await interaction.update({ embeds: [successEmbed], components: []});
                timeout_delete(messageId);
            },
            timeout: false
        }
    },
    entry: async function(interaction: ButtonInteraction): Promise<void> {
        console.log('interaction run: button_settings_prefix_yes');
        const clientId: string = interaction.user.id;
        const messageId: string = interaction.message.id;

        const interaction_check: {
            valid: true
        } | {
            valid: false,
            type: 'outdated' | 'not_owner'
        } = is_valid_interaction(messageId, clientId);

        if (!interaction_check.valid) {
            if (interaction_check.type === 'outdated') {
                const [outdated_interaction_text]: string[] = await get_display_text(['general.outdated_interaction'], clientId);
                const outdated_embed: EmbedBuilder = await ui_error_non_fatal(clientId, outdated_interaction_text ?? display_error_str);
                await interaction.update({embeds: [outdated_embed], components: []});
            }
            return;
        }
        await this.states.prefix_yes.execute(interaction);
    }
}

export default button_yes_interaction;


async function sequelize_prefix_yes(interaction: ButtonInteraction, prefix: string, clientId: string): Promise<boolean> {

    if (interaction.guildId === null) {
        console.log('message.guildId should exists: ./utility/settings_prefix/button_yes.js');
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
        await interaction.update({embeds: [errorEmbed], components: []});
        return (false);
    }

    const settings_Temp: TempPrefixSettingInstance | null = await TEMP_PREFIX_SETTINGS.findOne({ where: { guildId: interaction.guildId } });
    if (settings_Temp !== null) {
        try {
            await TEMP_PREFIX_SETTINGS.destroy({ where: { guildId: interaction.guildId } });
        } catch (error) {
            console.error(error);
            const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
            await interaction.update({embeds: [errorEmbed], components: []});
        }
    }

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings: ServerSettingsInstance | null = await SERVER_SETTINGS.findOne({ where: { guildId: interaction.guildId } });

    if (settings !== null) {
        //guildId exist, update data:
        // equivalent to: UPDATE SETTINGS (lang) values (?) WHERE clientId='?';
        const [affectedCount] = await SERVER_SETTINGS.update({ prefix: prefix }, { where: { guildId: interaction.guildId } });
        if (affectedCount > 0) {
            return (true);
        };
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D3');
        await interaction.update({embeds: [errorEmbed], components: []});
        return (false);
    };
    //clientId not exist, create new data:
    try {
        // equivalent to: INSERT INTO SETTINGS (clientId, lang, hardMode) values (?, ?, ?);
        await SERVER_SETTINGS.create({
            guildId: interaction.guildId,
            prefix: prefix,
        })
        return (true);
    }
    catch (error) {
        console.log(error);
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D1');
        await interaction.update({embeds: [errorEmbed], components: []});
        return (false);
    };
};