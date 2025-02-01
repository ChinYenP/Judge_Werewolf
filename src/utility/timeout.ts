import { Collection, Message } from 'discord.js';
import { delete_message } from './delete_message.js';
import { Client } from 'discord.js';
import { isMyClient } from '../declare_type/type_guard.js';

const timeouts = new Collection<string, [string, string, string, NodeJS.Timeout]>();
//messageId -> [channelId, command, clientId, setTimeout instance]
const client_to_message = new Collection<string, string[]>();
//clientId -> [messageId, ...]

async function interaction_is_outdated(messageId: string): Promise<boolean> {
    return (!(timeouts.has(messageId)));
}

async function is_interaction_owner(messageId: string, clientId: string): Promise<boolean> {
    if (timeouts.has(messageId)) {
        const timeoutEntry: [string, string, string, NodeJS.Timeout] | undefined = timeouts.get(messageId);
        if (timeoutEntry && timeoutEntry[2] === clientId) {
            return (true);
        }
        return (false);
    }
    throw new Error(`Message ID ${messageId} not found in timeouts.`);
}

async function timeout_delete_message(clientId: string, command: t_cooldown, bot_client_instance: Client): Promise<void> {
    if (!isMyClient(bot_client_instance)) return;
    const client_to_message_arr: string[] | undefined = client_to_message.get(clientId);
    if (client_to_message.has(clientId)) {
        if (client_to_message_arr == undefined) return;
        if (command === 'clean_all') {
            for (let i = 0; i < client_to_message_arr.length; i++) {
                const oldMessageId: string | undefined = client_to_message_arr[i];
                if (oldMessageId === undefined) continue;
                const timeoutEntry: [string, string, string, NodeJS.Timeout] | undefined = timeouts.get(oldMessageId);
                if (timeoutEntry === undefined) continue;
                const oldChannelId: string = timeoutEntry[0];
                await timeout_delete(oldMessageId, clientId);
                await delete_message(oldMessageId, oldChannelId, bot_client_instance);
            }
            return;
        }
        for (let i = 0; i < client_to_message_arr.length; i++) {
            const oldMessageId: string | undefined = client_to_message_arr[i];
            if (oldMessageId === undefined) continue;
            const timeoutEntry: [string, string, string, NodeJS.Timeout] | undefined = timeouts.get(oldMessageId);
            if (timeoutEntry === undefined) continue;
            if (timeoutEntry[1] === command) {
                const oldChannelId: string = timeoutEntry[0];
                await timeout_delete(oldMessageId, clientId);
                await delete_message(oldMessageId, oldChannelId, bot_client_instance);
                return;
            }
        }
    }
}

async function timeout_set(command: string, messageId: string, clientId: string, channelId: string, time_sec: number, timeout_execute: (bot_reply: Message) => Promise<void>, execute_param: Message): Promise<void> {
    if (timeouts.has(messageId)) {
        await timeout_delete(messageId, clientId);
    };
    //Set timer while add data to database:
    timeouts.set(messageId, [channelId, command, clientId, setTimeout(async () => {
        await timeout_execute(execute_param);
        await timeout_delete(messageId, clientId);
    }, (time_sec * 1000))]);
    if (client_to_message.has(clientId)) {
        const messageList: string[] | undefined = client_to_message.get(clientId);
        if (messageList === undefined) return;
        messageList.push(messageId);
    } else {
        client_to_message.set(clientId, [messageId]);
    }
}


async function timeout_delete(messageId: string, clientId: string): Promise<void> {
    if (timeouts.has(messageId)) {
        const timeoutEntry: [string, string, string, NodeJS.Timeout] | undefined = timeouts.get(messageId);
        if (timeoutEntry == undefined) return;
        clearTimeout(timeoutEntry[3]);
        timeouts.delete(messageId);
        const client_to_message_arr: string[] | undefined = client_to_message.get(clientId);
        if (client_to_message_arr == undefined) return;
        for (let i = 0; i < client_to_message_arr.length; i++) {
            if (client_to_message_arr[i] === messageId) {
                client_to_message_arr.splice(i, 1);
                if (client_to_message_arr.length === 0) {
                    client_to_message.delete(clientId);
                }
                return;
            }
        }
    }
}

async function shutdown_timeout(bot_client_instance: Client): Promise<void> {
    if (!isMyClient(bot_client_instance)) return;
    try {
        for (const [key] of client_to_message) {
            await timeout_delete_message(key, 'clean_all', bot_client_instance);
        }
    } catch (err) {
        console.error(err);
    }
}

export { interaction_is_outdated, shutdown_timeout, timeout_set, timeout_delete, is_interaction_owner, timeout_delete_message }