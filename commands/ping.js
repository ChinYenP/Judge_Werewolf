const myEmitter = require('../utility/emitter.js');
const { check_cooldown } = require('../utility/cooldown.js');
const { get_display_text, get_display_error_code } = require('../utility/get_display.js');
const config = require('../text_data_config/config.json');

module.exports = {

    name: 'ping',
    async execute(message, args) {
        console.log(`Ping command ran, args: ${args}`);

        let display_arr = '';

        //Check cooldown
        const cooldown_arr = await check_cooldown(message.author.id, 'ping', config.cooldown_sec.ping);
        switch (cooldown_arr[0]) {
            case 0:
                display_arr = await get_display_text(['general.timeout_display'], message.author.id);
                if (display_arr.length !== 1) {
                    console.error('DSPY error at ./commands/ping.js, no1');
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
                    console.error('DSPY error at ./commands/ping.js, no2');
                    await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                    return;
                };
                console.error(`${cooldown_arr[1]  } error at ./commands/ping.js, no3`);
                await message.reply(display_arr[0]);
                return;
            default:
                display_arr = await get_display_error_code('U', message.author.id);
                if (display_arr.length !== 1) {
                    console.error('DSPY error at ./commands/ping.js, no4');
                    await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                    return;
                };
                console.error('U error at ./commands/ping.js, no5');
                await message.reply(display_arr[0]);
                return;
        };

        const sent = await message.reply({ content: 'Pinging...', fetchReply: true });
        const latency = sent.createdTimestamp - message.createdTimestamp;
        
        let ws_latency = 0;
        try {
            const getWebsocketLatencyPromise = new Promise((resolve) => {
                myEmitter.emit('getWebsocketLatency', resolve);
            });
            // Call the function and log the latency
            getWebsocketLatencyPromise.then((ws_latency_event) => {
                ws_latency = ws_latency_event;
            });
        } catch (error) {
            console.error(error);
            return;
        };

        display_arr = await get_display_text(['ping.pong', 'ping.latency', 'ping.ws_latency'], message.author.id);
        if (display_arr.length !== 3) {
            console.error('DSPY error at ./commands/ping.js, no6');
            await message.reply('Something has gone wrong during the code runtime: Error DSPY');
            return;
        };
        const text = `${display_arr[0]}\n${display_arr[1]}${latency}ms\n${display_arr[2]}${ws_latency}ms`;

        try {
            await sent.edit(text);
        } catch (err) {
            console.error(err);
            display_arr = await get_display_error_code('M1', message.author.id);
            if (display_arr.length !== 1) {
                console.error('DSPY error at ./commands/ping.js, no7');
                await message.reply('Something has gone wrong during the code runtime: Error DSPY');
                return;
            };
            console.error('M1 error at ./commands/ping.js, no8');
            await message.reply(display_arr[0]);
        };
    },

};