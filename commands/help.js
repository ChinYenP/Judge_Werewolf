const { check_cooldown } = require('../utility/cooldown.js');
const { get_display_text, get_display_error_code } = require('../utility/get_display.js');
const config = require('../text_data_config/config.json');

module.exports = {

    name: 'help',
    async execute(message, args) {
        console.log(`Help command ran, args: ${args}`);

        let display_arr = '';

        //Check cooldown
        const cooldown_arr = await check_cooldown(message.author.id, 'help', config.cooldown_sec.help);
        switch (cooldown_arr[0]) {
            case 0:
                display_arr = await get_display_text(['general.timeout_display'], message.author.id);
                if (display_arr.length !== 1) {
                    console.error('DSPY error at ./commands/help.js, no1');
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
                    console.error('DSPY error at ./commands/help.js, no2');
                    await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                    return;
                };
                console.error(`${cooldown_arr[1]  } error at ./commands/help.js, no3`);
                await message.reply(display_arr[0]);
                return;
            default:
                display_arr = await get_display_error_code('U', message.author.id);
                if (display_arr.length !== 1) {
                    console.error('DSPY error at ./commands/help.js, no4');
                    await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                    return;
                };
                console.error('U error at ./commands/help.js, no5');
                await message.reply(display_arr[0]);
                return;
        };

        display_arr = await get_display_text(['help'], message.author.id);
        if (display_arr.length !== 1) {
            console.error('DSPY error at ./commands/help.js, no6');
            await message.reply('Something has gone wrong during the code runtime: Error DSPY');
            return;
        };

        await message.reply(display_arr[0]);
    },

};