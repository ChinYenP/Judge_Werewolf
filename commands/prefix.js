const { check_cooldown } = require('../utility/cooldown.js');
const { get_display_text, get_display_error_code } = require('../utility/get_display.js');
const { prefix_validation } = require('../utility/validation/prefix_validation.js');
const db = require('../database/sqlite_db.js');
const config = require('../text_data_config/config.json');

module.exports = {

    name: 'prefix',
    async execute(message, args) {
        console.log(`Prefix command ran, args: ${args}`);

        let display_arr = '';

        //Check cooldown
        const cooldown_arr = await check_cooldown(message.author.id, 'prefix', config.cooldown_sec.prefix);
        switch (cooldown_arr[0]) {
            case 0:
                display_arr = await get_display_text(['general.timeout_display'], message.author.id);
                if (display_arr.length !== 1) {
                    console.error('DSPY error at ./commands/prefix.js, no1');
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
                    console.error('DSPY error at ./commands/prefix.js, no2');
                    await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                    return;
                };
                console.error(`${cooldown_arr[1]  } error at ./commands/prefix.js, no3`);
                await message.reply(display_arr[0]);
                return;
            default:
                display_arr = await get_display_error_code('U', message.author.id);
                if (display_arr.length !== 1) {
                    console.error('DSPY error at ./commands/prefix.js, no4');
                    await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                    return;
                };
                console.error('U error at ./commands/prefix.js, no5');
                await message.reply(display_arr[0]);
                return;
        };

        const settings = await db.SERVER_SETTINGS.findOne({ where: { guildId: message.guildId } });
        let prefix = '';
        if (settings !== null) {
            //guildId exist
            prefix = settings.prefix;
        } else {
            //guildId not exist
            prefix = config.default_prefix;
        };
        //Validate prefix
        if (!(await prefix_validation(prefix))) {
            await message.reply(await get_display_error_code('C3', message.author.id));
            console.error('C3 error at ./commands/prefix.js, no6');
        };

        display_arr = await get_display_text(['prefix.current_prefix', 'prefix.instruction'], message.author.id);
        if (display_arr.length !== 2) {
            console.error('DSPY error at ./commands/help.js, no7');
            await message.reply('Something has gone wrong during the code runtime: Error DSPY');
            return;
        };

        await message.reply(`${display_arr[0] + prefix  }\n${  display_arr[1]}`);
    },

};