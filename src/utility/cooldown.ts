import { command_validation } from './validation/command_validation.js';
import { get_display_text, get_display_error_code } from './get_display.js';
import { isMyClient } from '../declare_type/type_guard.js';
import { Message, Client } from 'discord.js';
import { config } from '../text_data_config/config.js';
import { CommandCooldownInstance, COMMAND_COOLDOWN } from '../database/sqlite_db.js';

async function check_cooldown(clientId: string, command: string, time_sec: number, bot_client_instance: Client, msg_interact_instance: Message): Promise<boolean> {

    //Check command
    if (!(await command_validation(command, bot_client_instance))) {
        await msg_interact_instance.reply((await get_display_error_code('C4', clientId)) ?? config['display_error']);
        return (false);
    }

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings: CommandCooldownInstance | null = await COMMAND_COOLDOWN.findOne({ where: { clientId: clientId, command: command } });
    if (settings !== null) {
        //data exist
        const expired_date: bigint = settings.expired_date;
        const date_now: number = Date.now();
        if (date_now < expired_date) {
            const display_arr: string[] = await get_display_text(['general.timeout_display'], clientId);
            await msg_interact_instance.reply(`${(display_arr[0] ?? config['display_error']) + String((Number(expired_date) - date_now) / 1000)}s`);
            return (false);
        }
    }
    return (await update_cooldown(clientId, command, time_sec, bot_client_instance, msg_interact_instance));
}

async function update_cooldown(clientId: string, command: string, time_sec: number, bot_client_instance: Client, msg_interact_instance: Message): Promise<boolean> {

    if (!isMyClient(bot_client_instance)) return (false);
    //Check command
    if (!(await command_validation(command, bot_client_instance))) {
        await msg_interact_instance.reply((await get_display_error_code('C4', clientId)) ?? config['display_error']);
        return (false);
    }

    const expired_date: number = Date.now() + (time_sec * 1000);

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const settings: CommandCooldownInstance | null = await COMMAND_COOLDOWN.findOne({ where: { clientId: clientId, command: command } });
    if (settings !== null) {
        //data exist
        const [affectedCount]: [number] = await COMMAND_COOLDOWN.update({ expired_date: BigInt(expired_date) }, { where: { clientId: clientId, command: command } });
        if (affectedCount > 0) {
            return (true);
        }
        await msg_interact_instance.reply((await get_display_error_code('D3', clientId)) ?? config['display_error']);
        return (false);
    }
    //Data not exist
    try {
        // equivalent to: INSERT INTO SETTINGS (clientId, lang, hardMode) values (?, ?, ?);
        await COMMAND_COOLDOWN.create({
            clientId: clientId,
            command: command,
            expired_date: BigInt(expired_date)
        })
        return (true);
    }
    catch (error) {
        console.log(error);
        await msg_interact_instance.reply((await get_display_error_code('D1', clientId)) ?? config['display_error']);
        return (false);
    }
}

export { check_cooldown }