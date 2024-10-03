const myEmitter = require('../emitter.js');
const { check_cooldown, update_cooldown } = require('../utility/cooldown.js');
const { get_display_text } = require('../utility/get_display/get_display_text.js');
const { get_display_error } = require('../utility/get_display/get_display_error.js');
const display_text = require('../display_text.json');

module.exports = {

    name: 'ping',
    async execute(message, args) {
        console.log(`Ping command ran, args: ${  args}`);

        let display_arr = "";

        //Check cooldown
        let cooldown_arr = await check_cooldown(message.author.id, 'ping');
        switch (cooldown_arr[0]) {
            case 'command_not_validate':
                return;
            case 'cooldown_over':
                update_cooldown(message.author.id, 'ping', display_text.general.cooldown_sec.ping);
                break;
            case 'cooldown_not_over':
                display_arr = await get_display_text(['general.timeout_display'], message.author.id);
                if (display_arr.length != 1) {
                    await message.reply('Something went wrong during retrieving text.');
                    return;
                };
                await message.reply(display_arr[0] + cooldown_arr[1] + "s");
                return;
            default:
                //Something went wrong.
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
            await message.reply('Something went wrong during retrieving text.');
            return;
        };
        const text = `${display_arr[0]}\n${display_arr[1]}${latency}ms\n${display_arr[2]}${ws_latency}ms`;

        try {
            await sent.edit(text);
        } catch (err) {
            console.error(err);
            display_arr = await get_display_error('message_edit_error', message.author.id);
            if (display_arr.length !== 1) {
                await message.reply('Something went wrong during retrieving text.');
                return;
            };
            await message.reply(display_arr[0]);
        };
    },

};