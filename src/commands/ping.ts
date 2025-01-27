import { check_cooldown } from '../utility/cooldown.js';
import { get_display_text, get_display_error_code } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';
import { Message } from 'discord.js';
import { isMyClient } from '../declare_type/type_guard.js';

export default {

    name: 'ping',
    cooldown_sec: config['cooldown_sec'].ping,
    timeout: false,
    async execute(message: Message, args: string[]): Promise<void> {
        console.log(`Ping command ran, args: ${args.join(", ")}`);

        const clientId: string = message.author.id;
        if (!isMyClient(message.client)) return;
        if (!await check_cooldown(clientId, this.name, this.cooldown_sec, message.client, message)) {
            return;
        }

        let sent: Message = await message.reply({ content: 'Pinging...'});
        sent = await sent.fetch();
        const latency: number = sent.createdTimestamp - message.createdTimestamp;

        const display_arr: string[] = await get_display_text(['ping.pong', 'ping.latency', 'ping.ws_latency'], message.author.id);
        if (display_arr.length !== 3) {
            console.error('DSPY error at ./commands/ping.js, no6');
            await message.reply(config['display_error']);
            return;
        }
        const text: string = `${display_arr[0] ?? config['display_error']}\n${display_arr[1] ?? config['display_error']}${latency.toString()}ms\n${display_arr[2] ?? config['display_error']}${message.client.ws.ping.toString()}ms`;

        try {
            await sent.edit(text);
        } catch (err) {
            console.error(err);
            await message.reply((await get_display_error_code('M1', message.author.id))[0] ?? config['display_error']);
        }
    }

}