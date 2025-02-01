import { check_cooldown } from '../utility/cooldown.js';
import { get_display_text, get_display_error_code } from '../utility/get_display.js';
import { prefix_validation } from '../utility/validation/prefix_validation.js';
import { config } from '../text_data_config/config.js';
import { Message } from 'discord.js';
import { ServerSettingsInstance, SERVER_SETTINGS } from '../database/sqlite_db.js';
import { isMyClient } from '../declare_type/type_guard.js';

export default {

    name: 'prefix',
    cooldown_sec: config['cooldown_sec'].prefix,
    timeout: false,
    async execute(message: Message, args: string[]): Promise<void> {
        console.log(`Prefix command ran, args: ${args.join(", ")}`);

        const clientId: string = message.author.id;
        if (!isMyClient(message.client)) return;
        if (!await check_cooldown(clientId, this.name, this.cooldown_sec, message.client, message)) {
            return;
        }

        let prefix: string = config['default_prefix'];
        if (message.guildId !== null) {
            const settings: ServerSettingsInstance | null = await SERVER_SETTINGS.findOne({ where: { guildId: message.guildId } });
            if (settings !== null) {
                //guildId exist
                prefix = settings.prefix;
            }
        }

        //Validate prefix
        if (!(await prefix_validation(prefix))) {
            await message.reply((await get_display_error_code('C3', message.author.id))[0] ?? config['display_error']);
        }

        const display_arr: string[] = await get_display_text(['prefix.current_prefix', 'prefix.instruction'], message.author.id);
        await message.reply(`${(display_arr[0] ?? config['display_error']) + prefix }\n${display_arr[1] ?? config['display_error']}`);
    }

}