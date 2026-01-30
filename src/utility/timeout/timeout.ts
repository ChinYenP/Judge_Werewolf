import { Collection, Message } from 'discord.js';
import { t_timeout_type } from '../../global/types/list_str.js';

const timeouts: Collection<string, Collection<string, [t_timeout_type, Message, NodeJS.Timeout]>>
= new Collection<string, Collection<string, [t_timeout_type, Message, NodeJS.Timeout]>>();
// clientId -> [messageId -> [timeout_type, bot_reply, setTimeout instance], messageId -> [...], ...]
const message_to_client: Collection<string, string> = new Collection<string, string>();

function external_delete_check(messageId: string): {exist: false} | {exist: true, clientId: string, timeout_type: t_timeout_type} {
    if (message_to_client.has(messageId)) {
        const clientId: string | undefined = message_to_client.get(messageId);
        if (clientId === undefined) return ({exist: false});
        const msg_obj: Collection<string, [t_timeout_type, Message, NodeJS.Timeout]> | undefined
            = timeouts.get(clientId);
        if (msg_obj === undefined) return ({exist: false});
        const obj: [t_timeout_type, Message, NodeJS.Timeout] | undefined = msg_obj.get(messageId);
        if (obj === undefined) return ({exist: false});
        return ({exist: true, clientId: clientId, timeout_type: obj[0]})
    }
    return ({exist: false});
}

function is_valid_interaction(messageId: string, clientId: string): {
    valid: true
} | {
    valid: false,
    type: 'outdated' | 'not_owner'
} {
    if (!message_to_client.has(messageId)) {
        return ({valid: false, type: 'outdated'});
    }
    if (message_to_client.get(messageId) !== clientId) {
        return ({valid: false, type: 'not_owner'});
    }
    return ({valid: true});
}

async function delete_message(clientId: string, timeout_type: t_timeout_type): Promise<void> {
    const client_timeout: Collection<string, [t_timeout_type, Message, NodeJS.Timeout]> | undefined
    = timeouts.get(clientId);
    if (client_timeout === undefined) return;
    const messageId_to_delete: string[] = [];
    const actual_message_to_delete: Message[] = [];
    for (const [key, value] of client_timeout) {
        if (value[0] === timeout_type) {
            clearTimeout(value[2]);
            messageId_to_delete.push(key);
            actual_message_to_delete.push(value[1]);
        }
    }
    for (const key of messageId_to_delete) {
        client_timeout.delete(key);
        message_to_client.delete(key);
    }
    if (client_timeout.size === 0) {
        timeouts.delete(clientId);
    }
    //ORDER MATTER!! Delete messageId from the Collections first, then only delete the messages.
    //This will prevent misunderstanding of self message deletion triggered by MessageDelete event.
    for (const key of actual_message_to_delete) {
        await key.delete(); //Delete message
    }
}

function timeout_set<Tdatas>(
    timeout_type: t_timeout_type,
    messageId: string,
    clientId: string,
    time_sec: number,
    timeout_execute: (bot_reply: Message, clientId: string, timeout_sec: number, data_passed: Tdatas) => Promise<void>,
    bot_reply: Message, datas: Tdatas): void {

    
    timeout_delete(clientId, timeout_type);
    //Set timer while add data to database:
    let client_timeout: Collection<string, [t_timeout_type, Message, NodeJS.Timeout]> | undefined
    = timeouts.get(clientId);
    if (client_timeout === undefined) {
        client_timeout = new Collection<string, [t_timeout_type, Message, NodeJS.Timeout]>();
        timeouts.set(clientId, client_timeout);
    }
    client_timeout.set(messageId, [timeout_type, bot_reply, setTimeout(() => {
        timeout_execute(bot_reply, clientId, time_sec, datas)
        .then(() => {
            timeout_delete(clientId, timeout_type);
        })
        .catch(console.error);
    }, (time_sec * 1000))]);
    message_to_client.set(messageId, clientId);
}


function timeout_delete(clientId: string, timeout_type: t_timeout_type): void {
    let client_timeout: Collection<string, [t_timeout_type, Message, NodeJS.Timeout]> | undefined = timeouts.get(clientId);
    if (client_timeout === undefined) return;
    let messageId_to_delete: string[] = [];
    for (const clientObj of client_timeout) {
        const messageId: string = clientObj[0];
        if (clientObj[1] === undefined || clientObj[1][0] !== timeout_type) continue;
        const message_timeout: [t_timeout_type, Message, NodeJS.Timeout] | undefined = client_timeout.get(messageId);
        if (message_timeout === undefined) return;
        clearTimeout(message_timeout[2]);
        client_timeout.delete(messageId);
        messageId_to_delete.push(messageId);
    }
    if (client_timeout.size === 0) {
        timeouts.delete(clientId);
    }
    for (const messageId of messageId_to_delete) {
        message_to_client.delete(messageId);
    }
}

async function shutdown_timeout(): Promise<void> {
    const actual_message_to_delete: Message[] = [];
    for (const [_, messageCollection] of timeouts) {
        for (const [_, value] of messageCollection) {
            actual_message_to_delete.push(value[1]);
            clearTimeout(value[2]);
        }
        messageCollection.clear();
    }
    timeouts.clear();
    message_to_client.clear();
    for (const msg of actual_message_to_delete) {
        await msg.delete();
    }
}

export { external_delete_check, is_valid_interaction, shutdown_timeout, timeout_set, timeout_delete, delete_message }