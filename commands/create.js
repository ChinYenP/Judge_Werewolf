const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { get_display_text, get_display_error_code } = require('../utility/get_display.js');
const { check_cooldown } = require('../utility/cooldown.js');
const { general_timeout_set, general_delete_message } = require('../utility/timeout/general_timeout.js');
const config = require('../text_data_config/config.json');

module.exports = {

    name: 'create',
    async execute(message, args) {
        console.log(`Create command ran, args: ${args}`);

        let display_arr = '';

        //Check cooldown
        const cooldown_arr = await check_cooldown(message.author.id, 'create', config.cooldown_sec.create, message.client);
        switch (cooldown_arr[0]) {
            case 0:
                display_arr = await get_display_text(['general.timeout_display'], message.author.id);
                if (display_arr.length !== 1) {
                    console.error('DSPY error at ./commands/create.js, no1');
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
                    console.error('DSPY error at ./commands/create.js, no2');
                    await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                    return;
                };
                console.error(`${cooldown_arr[1]  } error at ./commands/create.js, no3`);
                await message.reply(display_arr[0]);
                return;
            default:
                display_arr = await get_display_error_code('U', message.author.id);
                if (display_arr.length !== 1) {
                    console.error('DSPY error at ./commands/create.js, no4');
                    await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                    return;
                };
                console.error('U error at ../commands/create.js, no5');
                await message.reply(display_arr[0]);
                return;
        };

        //Check arguments
        if (args.length > 1) {
            //Too much arguments
            const much_args_text = await get_display_text(['general.command_args_error.much_args'], message.author.id);
            if (much_args_text.length !== 1) {
                console.error('DSPY error at ./commands/create.js, no6');
                await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                return;
            };
            await message.reply(`create${  much_args_text[0]}`);
            return;
        };

        //Create by ID
        if (args.length === 1) {
            await message.reply('Create by ID coming soon.');
            return;
        };

        //For general create
        await general_create(message);
        
    },
};


async function general_create(message) {

    await general_delete_message(message.author.id, 'create', message.client);
    const time_sec = config.timeout_sec.create.initial;
    const display_arr = await get_display_text(['create.initial', 'create.initial.select_num_player',
        'create.initial.placeholder_preset_custom', 'create.initial.preset', 'create.initial.custom',
        'create.initial.button_next', 'create.initial.button_cancel', 'create.timeout'], message.author.id);
    if (display_arr.length !== 8) {
        console.error('DSPY error at ./commands/create.js, no11');
        await message.reply('Something has gone wrong during the code runtime: Error DSPY');
        return;
    };

    const rowNumPlayer = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('create_initial_num_player')
                .setPlaceholder(display_arr[1])
                .addOptions(
                    {
                        label: '6',
                        description: 'Six',
                        value: '6'
                    },
                    {
                        label: '7',
                        description: 'Seven',
                        value: '7'
                    },
                    {
                        label: '8',
                        description: 'Eight',
                        value: '8'
                    },
                    {
                        label: '9',
                        description: 'Nine',
                        value: '9'
                    },
                    {
                        label: '10',
                        description: 'Ten',
                        value: '10'
                    },
                    {
                        label: '11',
                        description: 'Eleven',
                        value: '11'
                    },
                    {
                        label: '12',
                        description: 'Twelve',
                        value: '12'
                    },
                ),
        );
    const rowPresetCustom = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('create_initial_preset_custom')
                .setPlaceholder(display_arr[2])
                .addOptions(
                    {
                        label: display_arr[3],
                        description: 'Preset',
                        value: 'preset'
                    },
                    {
                        label: display_arr[4],
                        description: 'Custom',
                        value: 'custom'
                    }
                ),
        );
        
    const next_button = new ButtonBuilder()
        .setCustomId('create_initial_next')
        .setLabel(display_arr[5])
        .setStyle(ButtonStyle.Success);

    const cancel_button = new ButtonBuilder()
        .setCustomId('create_initial_cancel')
        .setLabel(display_arr[6])
        .setStyle(ButtonStyle.Secondary);
        
    const rowButton = new ActionRowBuilder()
        .addComponents(cancel_button, next_button);
    
    const bot_reply = await message.reply({ content: display_arr[0], components: [rowNumPlayer, rowPresetCustom, rowButton] });
    await general_timeout_set('create', bot_reply.id, message.author.id, message.channelId, time_sec, message_timeout, bot_reply);

    async function message_timeout(bot_reply) {
        const timeout_content = `${display_arr[0]}\n\n${display_arr[7] + time_sec}s`;
        await bot_reply.edit({ content: timeout_content, components: [] });
    };

};