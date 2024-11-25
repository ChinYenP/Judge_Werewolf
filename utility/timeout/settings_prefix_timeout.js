const { Collection } = require('discord.js');
const { delete_message } = require('../delete_message.js');

const prefix_timeouts = new Collection();
//messageId -> [userId, setTimeout instance]
const prefix_client_to_message = new Collection();
//clientId -> [messageId, channelId, guildId]
const prefix_confirm_collection = new Collection();
//guildId -> prefix

async function settings_prefix_timeout_has_messageId(messageId) {
    return (prefix_timeouts.has(messageId));
};

async function settings_prefix_is_message_author(messageId, clientId) {
    if (prefix_timeouts.has(messageId)) {
        if ((prefix_timeouts.get(messageId))[0] === clientId) {
            return (true);
        };
        return (false);
    };
    return (true);
};

async function settings_prefix_timeouts_message_get_clientId(messageId) {
    return ((prefix_timeouts.get(messageId))[0]);
};

async function settings_get_prefix(guildId) {
    if (prefix_confirm_collection.has(guildId)) {
        return ([true, prefix_confirm_collection.get(guildId)]);
    };
    return ([false]);
};

async function settings_prefix_delete_message(clientId, bot_client_instance) {
    if (prefix_client_to_message.has(clientId)) {
        const oldMessageId = prefix_client_to_message.get(clientId)[0];
        const oldChannelId = prefix_client_to_message.get(clientId)[1];
        const oldGuildId = prefix_client_to_message.get(clientId)[2];
        await settings_prefix_timeout_delete(oldMessageId, clientId, oldGuildId);
        await delete_message(oldMessageId, oldChannelId, bot_client_instance);
    };
};

async function settings_prefix_timeout_set(prefix, messageId, clientId, channelId, guildId, time_sec, timeout_execute, execute_param_arr) {
    if (prefix_timeouts.has(messageId)) {
        await settings_prefix_timeout_delete(messageId, clientId);
    };

    //Set timer while add data to database:
    prefix_timeouts.set(messageId, [clientId, setTimeout(async () => {
        await timeout_execute(execute_param_arr);
        await settings_prefix_timeout_delete(messageId, clientId);
    }, (time_sec * 1000))]);
    prefix_client_to_message.set(clientId, [messageId, channelId, guildId]);
    prefix_confirm_collection.set(guildId, prefix);
};

async function settings_prefix_timeout_delete(messageId, clientId, guildId) {
    if (prefix_timeouts.has(messageId)) {
        clearTimeout((prefix_timeouts.get(messageId))[1]);
        prefix_timeouts.delete(messageId);
        prefix_client_to_message.delete(clientId);
        prefix_confirm_collection.delete(guildId);
    };
};

async function shutdown_settings_prefix_timeout(bot_client_instance) {
    try {
        for (const [key] of prefix_client_to_message) {
            await settings_prefix_delete_message(key, bot_client_instance);
        };
    } catch (err) {
        console.error(err);
    };
};

module.exports = { settings_prefix_timeout_has_messageId,
    settings_prefix_timeouts_message_get_clientId,
    shutdown_settings_prefix_timeout,
    settings_prefix_timeout_set,
    settings_get_prefix,
    settings_prefix_is_message_author,
    settings_prefix_delete_message,
    settings_prefix_timeout_delete };