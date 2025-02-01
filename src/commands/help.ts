import { check_cooldown } from '../utility/cooldown.js';
import { get_display_text, get_display_error_code } from '../utility/get_display.js';
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

        const [help_text]: string[] = await get_display_text(['help'], clientId);

        try {
            await message.reply(help_text ?? config['display_error']);
        } catch (error) {
            console.error(error);
            await message.reply((await get_display_error_code('M1', message.author.id))[0] ?? config['display_error']);
        }
    }

}