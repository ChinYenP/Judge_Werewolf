const { check_cooldown } = require('../utility/cooldown.js');
const { get_display_text, get_display_error_code } = require('../utility/get_display.js');
const config = require('../text_data_config/config.json');

module.exports = {

    name: 'ping',
    cooldown_sec: config.cooldown_sec.ping,
    timeout: false,
    async execute(message, args) {
        console.log(`Ping command ran, args: ${args}`);

        let display_arr = '';

        const clientId = message.author.id;
        if (!await check_cooldown(clientId, this.name, this.cooldown_sec, message.client, message)) {
            return;
        };

        const sent = await message.reply({ content: 'Pinging...', fetchReply: true });
        const latency = sent.createdTimestamp - message.createdTimestamp;

        display_arr = await get_display_text(['ping.pong', 'ping.latency', 'ping.ws_latency'], message.author.id);
        if (display_arr.length !== 3) {
            console.error('DSPY error at ./commands/ping.js, no6');
            await message.reply('Something has gone wrong during the code runtime: Error DSPY');
            return;
        };
        const text = `${display_arr[0]}\n${display_arr[1]}${latency}ms\n${display_arr[2]}${message.client.ws.ping}ms`;

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