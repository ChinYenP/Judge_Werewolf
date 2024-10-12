const { Collection } = require('discord.js');
const myEmitter = require('../../emitter.js');

const timeouts = new Collection();
//messageId -> [userId, setTimeout instance]
const client_to_message = new Collection();
//clientId -> [messageId, channelId]

async function settings_general_is_message_author(messageId, clientId) {
    if (timeouts.has(messageId)) {
        if ((timeouts.get(messageId))[0] === clientId) {
            return (true);
        };
        return (false);
    };
    return (true);
};

async function settings_general_delete_message(clientId) {
    if (client_to_message.has(clientId)) {
        const oldMessageId = client_to_message.get(clientId)[0];
        const oldChannelId = client_to_message.get(clientId)[1];
        await settings_general_timeout_delete(oldMessageId, clientId);
        await new Promise((resolve) => {
            const emit_complete = 'deleteMessageCompleteSettingsGeneralTImeout';
            myEmitter.once(emit_complete, resolve); // Listen for the completion
            myEmitter.emit('deleteMessage', { channelId: oldChannelId, messageId: oldMessageId, emit_complete: emit_complete });
        });
    };
};

async function settings_general_timeout_set(messageId, clientId, channelId, time_sec, timeout_execute, execute_param_arr) {

    if (timeouts.has(messageId)) {
        await settings_general_timeout_delete(messageId, clientId);
    };

    //Set timer while add data to database:
    timeouts.set(messageId, [clientId, setTimeout(() => {
        timeout_execute(execute_param_arr);
        settings_general_timeout_delete(messageId, clientId);
    }, (time_sec * 1000))]);
    client_to_message.set(clientId, [messageId, channelId]);
};

async function settings_general_timeout_delete(messageId, clientId) {
    if (timeouts.has(messageId)) {
        clearTimeout((timeouts.get(messageId))[1]);
        timeouts.delete(messageId);
        client_to_message.delete(clientId);
    };
};

async function shutdown_settings_general_timeout() {
    try {
        client_to_message.forEach(async (value, key) => {
            console.log("general:" + key)
            await settings_general_delete_message(key);
        });
    } catch (err) {
        console.error(err);
    };
};

module.exports = { shutdown_settings_general_timeout, settings_general_timeout_set, settings_general_is_message_author, settings_general_delete_message };