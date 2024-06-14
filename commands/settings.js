const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const display_text = require('../display_text.json');
const db = require('../sqlite_db.js');
const { prefix_validation } = require('../utility/validation/prefix_validation.js');
const { get_display_text } = require('../utility/get_display/get_display_text.js');
const { get_display_error } = require('../utility/get_display/get_display_error.js');

module.exports = {

    name: 'settings',
    async execute(message, args) {
        console.log(`Settings command ran, args: ${  args}`);

        // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
        const settings = await db.USER_SETTINGS.findOne({ where: { clientId: message.author.id } });
        let language = '';

        if (settings !== null) {
            //clientId exist
            switch (settings.lang) {
                case 'eng':
                    language = 'eng';
                    break;
                case 'malay':
                    language = 'malay';
                    break;
                case 'schi':
                    language = 'schi';
                    break;
                case 'tchi':
                    language = 'tchi';
                    break;
                case 'yue':
                    language = 'yue';
                    break;
                default:
                    const error_msg = display_text.general.error.display.eng + display_text.general.error.error_code.select_menu;
                    await message.reply(error_msg);
            };
        } else {
            //clientId not exist
            language = 'eng';
        };


        //Check arguments
        if (args.length === 1) {
            //Too less arguments
            const less_args_text = await get_display_error('less_args', message.author.id);
            if (less_args_text.length !== 1) {
                await message.reply('Something went wrong during retrieving text.');
                return;
            };
            await message.reply(`settings${  less_args_text[0]}`);
            return;
        };
        if (args.length > 2) {
            //Too much arguments
            const much_args_text = await get_display_error('much_args', message.author.id);
            if (much_args_text.length !== 1) {
                await message.reply('Something went wrong during retrieving text.');
                return;
            };
            await message.reply(`settings${  much_args_text[0]}`);
            return;
        };
        if (args.length === 2 && !(message.member.permissionsIn(message.channel).has('Administrator'))) {
            //No permission for server settings
            const no_administrator_text = await get_display_error('not_administrator', message.author.id);
            if (no_administrator_text.length !== 1) {
                await message.reply('Something went wrong during retrieving text.');
                return;
            };
            await message.reply(no_administrator_text[0]);
            return;
        };

        if (args.length === 2 && message.member.permissionsIn(message.channel).has('Administrator')) {
            if (args[0] === 'prefix') {
                if (await prefix_validation(args[1])) {
                    //Valid argument for prefix
                    await prefix_settings(message, args, language);
                    return;
                };
                //Invalid argument for prefix
                const invalid_prefix_text = await get_display_error('settings_prefix_invalid', message.author.id);
                if (invalid_prefix_text.length !== 1) {
                    await message.reply('Something went wrong during retrieving text.');
                    return;
                };
                const allow_characters = process.env.ALLOWED_PREFIX_CHARACTERS;
                await message.reply(invalid_prefix_text + allow_characters);
                return;
            };
            //Does not match any server settings
            const args_error_text = await get_display_error('wrong_args', message.author.id);
            if (args_error_text.length !== 1) {
                await message.reply('Something went wrong during retrieving text.');
                return;
            };
            await message.reply(`settings${  args_error_text[0]  }${args[0]}`);
            return;
        };

        //For general settings
        await general_settings(message, language);
        

    },

};


async function general_settings(message, language) {

    const { settings_general_timeout_set, settings_general_delete_message } = require('../utility/timeout/settings_general_timeout.js');

    await settings_general_delete_message(message.author.id);
    let user_text = '';
    let server_text = '';
    let placeholder_text = '';
    let timeout_text = '';
    const time_sec = display_text.general.timeout_sec.settings.general;
    const allowed_symbol_text = process.env.ALLOWED_PREFIX_CHARACTERS;
    switch (language) {
        case 'eng':
            user_text = `${display_text.settings.user_settings.eng}`;
            server_text = `${display_text.settings.server_settings.eng}${allowed_symbol_text}`;
            placeholder_text = display_text.settings.user_settings.placeholder_text.lang.eng;
            timeout_text = `${display_text.settings.timeout.eng + time_sec  }s`;
            break;
        case 'malay':
            user_text = `${display_text.settings.user_settings.malay}`;
            server_text = `${display_text.settings.server_settings.malay}${allowed_symbol_text}`;
            placeholder_text = display_text.settings.user_settings.placeholder_text.lang.malay;
            timeout_text = `${display_text.settings.timeout.malay + time_sec  }s`;
            break;
        case 'schi':
            user_text = `${display_text.settings.user_settings.schi}`;
            server_text = `${display_text.settings.server_settings.schi}${allowed_symbol_text}`;
            placeholder_text = display_text.settings.user_settings.placeholder_text.lang.schi;
            timeout_text = `${display_text.settings.timeout.schi + time_sec  }s`;
            break;
        case 'tchi':
            user_text = `${display_text.settings.user_settings.tchi}`;
            server_text = `${display_text.settings.server_settings.tchi}${allowed_symbol_text}`;
            placeholder_text = display_text.settings.user_settings.placeholder_text.lang.tchi;
            timeout_text = `${display_text.settings.timeout.tchi + time_sec  }s`;
            break;
        case 'yue':
            user_text = `${display_text.settings.user_settings.yue}`;
            server_text = `${display_text.settings.server_settings.yue}${allowed_symbol_text}`;
            placeholder_text = display_text.settings.user_settings.placeholder_text.lang.yue;
            timeout_text = `${display_text.settings.timeout.yue + time_sec  }s`;
            break;
    };

    const rowLang = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select lang')
                .setPlaceholder(placeholder_text)
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
    
    const Content = `${user_text  }\n\n${  server_text}`;
    const bot_reply = await message.reply({ content: Content, components: [rowLang] });
    settings_general_timeout_set(bot_reply.id, message.author.id, message.channelId, time_sec, message_timeout, bot_reply);

    async function message_timeout(bot_reply) {
        const timeout_content = `${user_text  }\n\n${  server_text  }\n\n${  timeout_text}`;
        await bot_reply.edit({ content: timeout_content, components: [] });
    };

};


async function prefix_settings(message, args, language) {

    const { settings_prefix_timeout_set, settings_prefix_delete_message } = require('../utility/timeout/settings_prefix_timeout.js');

    await settings_prefix_delete_message(message.author.id);
    let confirmation_text = '';
    let button_yes_text = '';
    let button_no_text = '';
    let timeout_text = '';
    const time_sec = display_text.general.timeout_sec.settings.server.prefix;
    switch (language) {
        case 'eng':
            confirmation_text = display_text.settings.server_settings.prefix.confirmation.eng;
            button_yes_text = display_text.settings.server_settings.prefix.button_yes.eng;
            button_no_text = display_text.settings.server_settings.prefix.button_no.eng;
            timeout_text = `${display_text.settings.server_settings.prefix.timeout_text.eng + time_sec  }s`;
            break;
        case 'malay':
            confirmation_text = display_text.settings.server_settings.prefix.confirmation.malay;
            button_yes_text = display_text.settings.server_settings.prefix.button_yes.malay;
            button_no_text = display_text.settings.server_settings.prefix.button_no.malay;
            timeout_text = `${display_text.settings.server_settings.prefix.timeout_text.malay + time_sec  }s`;
            break;
        case 'schi':
            confirmation_text = display_text.settings.server_settings.prefix.confirmation.schi;
            button_yes_text = display_text.settings.server_settings.prefix.button_yes.schi;
            button_no_text = display_text.settings.server_settings.prefix.button_no.schi;
            timeout_text = `${display_text.settings.server_settings.prefix.timeout_text.schi + time_sec  }s`;
            break;
        case 'tchi':
            confirmation_text = display_text.settings.server_settings.prefix.confirmation.tchi;
            button_yes_text = display_text.settings.server_settings.prefix.button_yes.tchi;
            button_no_text = display_text.settings.server_settings.prefix.button_no.tchi;
            timeout_text = `${display_text.settings.server_settings.prefix.timeout_text.tchi + time_sec  }s`;
            break;
        case 'yue':
            confirmation_text = display_text.settings.server_settings.prefix.confirmation.yue;
            button_yes_text = display_text.settings.server_settings.prefix.button_yes.yue;
            button_no_text = display_text.settings.server_settings.prefix.button_no.yue;
            timeout_text = `${display_text.settings.server_settings.prefix.timeout_text.yue + time_sec  }s`;
            break;
    };

    const yes_button = new ButtonBuilder()
        .setCustomId('settings_prefix_yes')
        .setLabel(button_yes_text)
        .setStyle(ButtonStyle.Success);

    const no_button = new ButtonBuilder()
        .setCustomId('settings_prefix_no')
        .setLabel(button_no_text)
        .setStyle(ButtonStyle.Secondary);
    
    const rowButton = new ActionRowBuilder()
        .addComponents(yes_button, no_button);
    
    const bot_reply = await message.reply({ content: confirmation_text + args[1], components: [rowButton] });
    settings_prefix_timeout_set(args[1], bot_reply.id, message.author.id, message.channelId, message.guildId, time_sec, message_timeout, bot_reply);

    async function message_timeout(bot_reply) {
        const timeout_content = `${confirmation_text + args[1]  }\n\n${  timeout_text}`;
        await bot_reply.edit({ content: timeout_content, components: [] });
    };

};