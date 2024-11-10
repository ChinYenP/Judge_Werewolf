const { Collection } = require('discord.js');
const myEmitter = require('../../emitter.js');

const timeouts = new Collection();
//messageId -> [channelId, command, clientId, setTimeout instance]
const client_to_message = new Collection();
//clientId -> [messageId, ...]

async function general_is_outdated(messageId) {
    return (!(timeouts.has(messageId)));
};

async function general_is_message_author(messageId, clientId) {
    if (timeouts.has(messageId)) {
        if ((timeouts.get(messageId))[2] === clientId) {
            return (true);
        };
        return (false);
    };
    return (true);
};

async function general_delete_message(clientId, command) {

    async function promise_handling(oldMessageId, oldChannelId) {
        clearTimeout((timeouts.get(oldMessageId))[3]);
        await new Promise((resolve) => {
            const emit_complete = 'deleteMessageCompleteGeneralTimeout';
            myEmitter.on(emit_complete, resolve); // Listen for the completion
            myEmitter.emit('deleteMessage', { channelId: oldChannelId, messageId: oldMessageId, emit_complete: emit_complete });
        });
    };

    let client_to_message_arr = await client_to_message.get(clientId);
    if (client_to_message.has(clientId)) {
        if (command == "") {
            for (let i = 0; i < client_to_message_arr.length; i++) {
                let oldMessageId = client_to_message_arr[i];
                let oldChannelId = (timeouts.get(oldMessageId))[0];
                await promise_handling(oldMessageId, oldChannelId);
            };
            return;
        };
        for (let i = 0; i < client_to_message_arr.length; i++) {
            let oldMessageId = client_to_message_arr[i];
            if ((timeouts.get(oldMessageId))[1] == command) {
                let oldChannelId = (timeouts.get(oldMessageId))[0];
                await promise_handling(oldMessageId, oldChannelId);
                return;
            };
        };
    };
};

async function general_timeout_set(command, messageId, clientId, channelId, time_sec, timeout_execute, execute_param_arr) {
    if (timeouts.has(messageId)) {
        await general_timeout_delete(messageId, clientId);
    };
    //Set timer while add data to database:
    timeouts.set(messageId, [channelId, command, clientId, setTimeout(async () => {
        await timeout_execute(execute_param_arr);
        await general_timeout_delete(messageId, clientId);
    }, (time_sec * 1000))]);
    if (client_to_message.has(clientId)) {
        (client_to_message.get(clientId)).push(messageId);
    } else {
        client_to_message.set(clientId, [messageId]);
    }
};

async function general_timeout_delete(messageId, clientId) {
    if (timeouts.has(messageId)) {
        clearTimeout((timeouts.get(messageId))[3]);
        timeouts.delete(messageId);
        let client_to_message_arr = client_to_message.get(clientId);
        for (let i = 0; i < client_to_message_arr.length; i++) {
            if (client_to_message_arr[i] == messageId) {
                client_to_message_arr.splice(i, 1);
                if (client_to_message_arr.length == 0) {
                    client_to_message.delete(clientId);
                };
                return;
            };
        };
    };
};

async function shutdown_general_timeout() {
    try {
        for (const [key, value] of client_to_message) {
            await general_delete_message(key, "");
        };
    } catch (err) {
        console.error(err);
    };
};

module.exports = { general_is_outdated, shutdown_general_timeout, general_timeout_set, general_is_message_author, general_delete_message };