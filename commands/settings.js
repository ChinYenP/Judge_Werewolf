const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { prefix_validation } = require('../utility/validation/prefix_validation.js');
const { get_display_text, get_display_error_code } = require('../utility/get_display.js');
const { check_cooldown } = require('../utility/cooldown.js');
const { general_timeout_set, general_delete_message } = require('../utility/timeout/general_timeout.js');
const { settings_prefix_timeout_set, settings_prefix_delete_message } = require('../utility/timeout/settings_prefix_timeout.js');
const config = require('../text_data_config/config.json');

module.exports = {

    name: 'settings',
    async execute(message, args) {
        console.log(`Settings command ran, args: ${args}`);

        let display_arr = '';

        //Check cooldown
        const cooldown_arr = await check_cooldown(message.author.id, 'settings', config.cooldown_sec.settings);
        switch (cooldown_arr[0]) {
            case 0:
                display_arr = await get_display_text(['general.timeout_display'], message.author.id);
                if (display_arr.length !== 1) {
                    console.error('DSPY error at ./commands/settings.js, no1');
                    await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                    return;
                };
                await message.reply(`${display_arr[0] + cooldown_arr[1]  }s`);
                return;
            case 1:
                break;
            case 2:
                display_arr = await get_display_error_code(cooldown_arr[1], message.author.id);
                if (display_arr.length !== 1) {
                    console.error('DSPY error at ./commands/settings.js, no2');
                    await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                    return;
                };
                console.error(`${cooldown_arr[1]  } error at ./commands/settings.js, no3`);
                await message.reply(display_arr[0]);
                return;
            default:
                display_arr = await get_display_error_code('U', message.author.id);
                if (display_arr.length !== 1) {
                    console.error('DSPY error at ./commands/settings.js, no4');
                    await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                    return;
                };
                console.error('U error at ../commands/settings.js, no5');
                await message.reply(display_arr[0]);
                return;
        };

        //Check arguments
        if (args.length === 1) {
            //Too less arguments
            const less_args_text = await get_display_text(['general.command_args_error.less_args'], message.author.id);
            if (less_args_text.length !== 1) {
                console.error('DSPY error at ./commands/settings.js, no6');
                await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                return;
            };
            await message.reply(`settings${  less_args_text[0]}`);
            return;
        };
        if (args.length > 2) {
            //Too much arguments
            const much_args_text = await get_display_text(['general.command_args_error.much_args'], message.author.id);
            if (much_args_text.length !== 1) {
                console.error('DSPY error at ./commands/settings.js, no7');
                await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                return;
            };
            await message.reply(`settings${  much_args_text[0]}`);
            return;
        };
        //Check administrator permission
        if (args.length === 2 && !(message.member.permissionsIn(message.channel).has('Administrator'))) {
            //No permission for server settings
            const not_administrator_text = await get_display_text(['general.permission_error.not_administrator'], message.author.id);
            if (not_administrator_text.length !== 1) {
                console.error('DSPY error at ./commands/settings.js, no8');
                await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                return;
            };
            await message.reply(`settings${  not_administrator_text[0]}`);
            return;
        };

        //Specific settings
        if (args.length === 2 && message.member.permissionsIn(message.channel).has('Administrator')) {
            if (args[0] === 'prefix') {
                if (await prefix_validation(args[1])) {
                    //Valid argument for prefix
                    await prefix_settings(message, args);
                    return;
                };
                //Invalid argument for prefix
                const invalid_prefix_text = await get_display_text(['settings.server_settings.prefix.invalid_prefix'], message.author.id);
                if (invalid_prefix_text.length !== 1) {
                    console.error('DSPY error at ./commands/settings.js, no9');
                    await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                    return;
                };
                const allow_characters = process.env.ALLOWED_PREFIX_CHARACTERS;
                await message.reply(invalid_prefix_text + allow_characters);
                return;
            };
            //Does not match any server settings
            const args_error_text = await get_display_text(['general.command_args_error.wrong_args'], message.author.id);
            if (args_error_text.length !== 1) {
                console.error('DSPY error at ./commands/settings.js, no10');
                await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                return;
            };
            await message.reply(`settings${  args_error_text[0]  }${args[0]}`);
            return;
        };

        //For general settings
        await general_settings(message);
        return;
    },

};


async function general_settings(message) {

    await general_delete_message(message.author.id, "settings");
    const time_sec = config.timeout_sec.settings.user;
    const allowed_symbol_text = process.env.ALLOWED_PREFIX_CHARACTERS;
    const display_arr = await get_display_text(['settings.user_settings', 'settings.server_settings', 'settings.user_settings.placeholder_text.lang', 'settings.timeout'], message.author.id);
    if (display_arr.length !== 4) {
        console.error('DSPY error at ./commands/create.js, no11');
        await message.reply('Something has gone wrong during the code runtime: Error DSPY');
        return;
    };
    const rowLang = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('settings_user_lang')
                .setPlaceholder(display_arr[2])
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
    
    const Content = `${display_arr[0]}\n\n${display_arr[1] + allowed_symbol_text}`;
    const bot_reply = await message.reply({ content: Content, components: [rowLang] });
    await general_timeout_set("settings", bot_reply.id, message.author.id, message.channelId, time_sec, message_timeout, bot_reply);

    async function message_timeout(bot_reply) {
        const timeout_content = `${display_arr[0]}\n\n${display_arr[1] + allowed_symbol_text}\n\n${`${display_arr[3] + time_sec  }s`}`;
        await bot_reply.edit({ content: timeout_content, components: [] });
    };

};


async function prefix_settings(message, args) {

    await settings_prefix_delete_message(message.author.id);
    const time_sec = config.timeout_sec.settings.server.prefix;
    const display_arr = await get_display_text(['settings.server_settings.prefix.confirmation',
        'settings.server_settings.prefix.button_yes',
        'settings.server_settings.prefix.button_no',
        'settings.server_settings.prefix.timeout_text'], message.author.id);
    if (display_arr.length !== 4) {
        console.error('DSPY error at ./commands/ping.js, no12');
        await message.reply('Something has gone wrong during the code runtime: Error DSPY');
        return;
    };

    const yes_button = new ButtonBuilder()
        .setCustomId('settings_prefix_yes')
        .setLabel(display_arr[1])
        .setStyle(ButtonStyle.Success);

    const no_button = new ButtonBuilder()
        .setCustomId('settings_prefix_no')
        .setLabel(display_arr[2])
        .setStyle(ButtonStyle.Secondary);
    
    const rowButton = new ActionRowBuilder()
        .addComponents(yes_button, no_button);
    
    const bot_reply = await message.reply({ content: display_arr[0] + args[1], components: [rowButton] });
    await settings_prefix_timeout_set(args[1], bot_reply.id, message.author.id, message.channelId, message.guildId, time_sec, message_prefix_timeout, bot_reply);

    async function message_prefix_timeout(bot_reply) {
        const timeout_content = `${display_arr[0] + args[1]}\n\n${display_arr[3] + time_sec}s`;
        await bot_reply.edit({ content: timeout_content, components: [] });
    };

};