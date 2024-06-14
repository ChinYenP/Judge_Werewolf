const myEmitter = require('../emitter.js');
const { check_cooldown, update_cooldown } = require('../utility/cooldown.js');
const { get_display_text } = require('../utility/get_display/get_display_text.js');
const { get_display_error } = require('../utility/get_display/get_display_error.js');

module.exports = {

    name: 'ping',
    async execute(message, args) {
        console.log(`Ping command ran, args: ${  args}`);


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

        let display_arr = await get_display_text(['ping.pong', 'ping.latency', 'ping.ws_latency'], message.author.id);
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