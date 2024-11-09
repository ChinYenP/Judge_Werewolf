const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const db = require('../../database/sqlite_db.js');
const { general_is_outdated, general_timeout_set, general_is_message_author } = require('../../utility/timeout/general_timeout.js');
const { get_display_text, get_display_error_code } = require('../../utility/get_display.js');
const config = require('../../text_data_config/config.json');

async function menu_select_lang(interaction) {
    
    if (!(await general_is_message_author(interaction.message.id, interaction.user.id))) {
        return;
    };

    console.log("Select menu: settings_prefix_lang");

    // if (general_is_outdated) {
    //     const outdated_interaction_text = await get_display_text(['general.outdated_interaction'], interaction.user.id);
    //     if (outdated_interaction_text.length !== 1) {
    //         console.error('DSPY error at ./interaction_elements/select menu/select_lang.js, no1');
    //         await interaction.message.edit({ content: 'Something has gone wrong during the code runtime: Error DSPY', components: [] });
    //         return;
    //     };
    //     await interaction.message.edit({ content: outdated_interaction_text[0], components: [] });
    //     return;
    // };

    let display_text = '';

    //Do sequelize thing here while get output text
    const sqlite_status = await sequelize_select_lang(interaction, interaction.values[0]);

    if (sqlite_status[0] === 0) {
        display_text = await get_display_error_code(sqlite_status[1], interaction.user.id);
        if (display_text.length !== 1) {
            console.error('DSPY error at ./interaction_elements/select menu/select_lang.js, no2');
            await interaction.message.edit({Content: 'Something has gone wrong during the code runtime: Error DSPY', Component: []});
            return;
        };
        console.error(`${sqlite_status[1]  } error at ./interaction_elements/select menu/select_lang.js, no3`);
        await interaction.message.edit({Content: display_text[0], Component: []});
        return;
    };

    //Success
    const time_sec = config.timeout_sec.settings.user;
    const allowed_symbol_text = process.env.ALLOWED_PREFIX_CHARACTERS;
    display_text = await get_display_text(['settings.user_settings','settings.server_settings','settings.user_settings.placeholder_text.lang','settings.timeout'], interaction.user.id);
    if (display_text.length !== 4) {
        console.error('DSPY error at ./interaction_elements/select menu/select_lang.js, no4');
        await interaction.message.edit({Content: 'Something has gone wrong during the code runtime: Error DSPY', Component: []});
        return;
    };
    const rowLang = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('settings_prefix_lang')
                .setPlaceholder(display_text[2])
                .addOptions(
                    {
                        label: 'English',
                        description: 'English',
                        value: 'eng',
                    },
                    {
                        label: 'Bahasa Melayu',
                        description: 'Malay',
                        value: 'malay'
                    },
                    {
                        label: '简体中文',
                        description: 'Simplified Chinese',
                        value: 'schi',
                    },
                    {
                        label: '繁體中文',
                        description: 'Traditional Chinese',
                        value: 'tchi',
                    },
                    {
                        label: '粵語',
                        description: 'Cantonese',
                        value: 'yue',
                    }
                ),
        );

    const Content = `${display_text[0]}\n\n${display_text[1] + allowed_symbol_text}`;
    
    const update_msg = await interaction.message.edit({ content: Content, components: [rowLang], fetchReply: true });
    await general_timeout_set("settings", update_msg.id, interaction.user.id, interaction.channelId, time_sec, interaction_timeout, update_msg);

    async function interaction_timeout(update_msg) {
        const timeout_content = `${display_text[0]}\n\n${display_text[1] + allowed_symbol_text}\n\n${display_text[3]}`;
        await update_msg.edit({ content: `${timeout_content + time_sec  }s`, components: [] });
    };
};


async function sequelize_select_lang(interaction, value) {

    /*
    [1] - success.
    [0, <str>] - error encountered, next element represents error code.
    */

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings = await db.USER_SETTINGS.findOne({ where: { clientId: interaction.user.id } });

    if (settings !== null) {
        //clientId exist, update data:
        // equivalent to: UPDATE SETTINGS (lang) values (?) WHERE clientId='?';
        const affectedRows = await db.USER_SETTINGS.update({ lang: value }, { where: { clientId: interaction.user.id } });
        if (affectedRows > 0) {
            return [1];
        };
        return [0, 'D3'];
    };
    //clientId not exist, create new data:
    try {
        // equivalent to: INSERT INTO SETTINGS (clientId, lang, hardMode) values (?, ?, ?);
        await db.USER_SETTINGS.create({
            clientId: interaction.user.id,
            lang: value,
        });
        return [1];
    }
    catch (error) {
        console.log(error);
        return [0, 'D1'];
    };
};

module.exports = { menu_select_lang };