import { command_validation } from './validation/command_validation.js';
import { get_display_text, get_display_error_code } from './get_display.js';
import { isMyClient } from '../declare_type/type_guard.js';
import { Message, Client } from 'discord.js';
import { config } from '../text_data_config/config.js';
import { CommandCooldownInstance, COMMAND_COOLDOWN } from '../database/sqlite_db.js';

async function check_cooldown(clientId: string, command: string, time_sec: number, bot_client_instance: Client, msg_interact_instance: Message): Promise<boolean> {

    //Check command
    if (!(await command_validation(command, bot_client_instance))) {
        const display_arr: string[] = await get_display_error_code('C4', clientId);
        if (display_arr.length !== 1) {
            console.error(`DSPY error at ${command} in cooldown.js, no1`);
            await msg_interact_instance.reply(config['display_error']);
            return (false);
        }
        console.error(`C4 error at ${command} in cooldown.js, no2`);
        await msg_interact_instance.reply(display_arr[0] ?? config['display_error']);
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
            if (display_arr.length !== 1) {
                console.error(`DSPY error at ${command} in cooldown.js, no3`);
                await msg_interact_instance.reply(config['display_error']);
                return (false);
            }
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
        const display_arr: string[] = await get_display_error_code('C4', clientId);
        if (display_arr.length !== 1) {
            console.error(`DSPY error at ${command} in cooldown.js, no4`);
            await msg_interact_instance.reply(config['display_error']);
            return (false);
        }
        console.error(`c$error at ${command} in cooldown.js, no5`);
        await msg_interact_instance.reply(display_arr[0] ?? config['display_error']);
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
        const display_arr: string[] = await get_display_error_code('D3', clientId);
            if (display_arr.length !== 1) {
                console.error(`DSPY error at ${command} in cooldown.js, no6`);
                await msg_interact_instance.reply(config['display_error']);
                return (false);
            }
            console.error(`D3 error at ${command} in cooldown.js, no7`);
            await msg_interact_instance.reply(display_arr[0] ?? config['display_error']);
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
        const display_arr: string[] = await get_display_error_code('D1', clientId);
        if (display_arr.length !== 1) {
            console.error(`DSPY error at ${command} in cooldown.js, no8`);
            await msg_interact_instance.reply(config['display_error']);
            return (false);
        }
        console.error(`D1 error at ${command} in cooldown.js, no9`);
        await msg_interact_instance.reply(display_arr[0] ?? config['display_error']);
        return (false);
    }
}

export { check_cooldown }