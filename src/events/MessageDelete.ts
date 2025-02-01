import { Message, Events } from 'discord.js';
import { interaction_is_outdated } from '../utility/timeout.js';
import { isTextChannel } from '../declare_type/type_guard.js';
/*import { TempPrefixSettingInstance, TEMP_PREFIX_SETTINGS } from '../database/sqlite_db.js'
import { get_display_error_code } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';*/

export default {
    name: Events.MessageDelete,
    once: false,
    async execute(message: Message): Promise<void> {
        if (message.author.id === message.client.user.id) return;
        if (!isTextChannel(message.channel)) return;
        if (await interaction_is_outdated(message.id)) return;
    }
}