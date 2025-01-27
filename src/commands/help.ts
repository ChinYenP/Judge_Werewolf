import { check_cooldown } from '../utility/cooldown.js';
import { get_display_text } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';
import { Message } from 'discord.js';
import { isMyClient } from '../declare_type/type_guard.js';

export default {

    name: 'help',
    cooldown_sec: config['cooldown_sec'].help,
    timeout: false,
    async execute(message: Message, args: string[]): Promise<void> {
        console.log(`Help command ran, args: ${args.join(", ")}`);

        const clientId: string = message.author.id;
        if (!isMyClient(message.client)) return;
        if (!await check_cooldown(clientId, this.name, this.cooldown_sec, message.client, message)) {
            return;
        }

        const display_arr: string[] = await get_display_text(['help'], clientId);
        if (display_arr.length !== 1) {
            console.error('DSPY error at ./commands/help.js, no6');
            await message.reply(config['display_error']);
            return;
        }

        await message.reply(display_arr[0] ?? config['display_error']);
    }

}