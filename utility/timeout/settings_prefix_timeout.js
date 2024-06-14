const { Collection } = require('discord.js');
const myEmitter = require('../../emitter.js');

var prefix_timeouts = new Collection();
//messageId -> [userId, setTimeout instance]
var prefix_client_to_message = new Collection();
//clientId -> [messageId, channelId, guildId]
var prefix_confirm_collection = new Collection();
//guildId -> prefix

async function settings_prefix_is_message_author(messageId, clientId) {
    if (prefix_timeouts.has(messageId)) {
        if ((prefix_timeouts.get(messageId))[0] == clientId) {
            return (true);
        };
        return (false);
    };
    return (true);
};

async function settings_get_prefix(guildId) {
    if (prefix_confirm_collection.has(guildId)) {
        return (prefix_confirm_collection.get(guildId));
    };
};

async function settings_prefix_delete_message(clientId) {
    if (prefix_client_to_message.has(clientId)) {
        let oldMessageId = prefix_client_to_message.get(clientId)[0];
        let oldChannelId = prefix_client_to_message.get(clientId)[1];
        let oldGuildId = prefix_client_to_message.get(clientId)[2];
        await settings_prefix_timeout_delete(oldMessageId, clientId, oldGuildId);
        myEmitter.emit('deleteMessage', { channelId: oldChannelId, messageId: oldMessageId });
    };
};

async function settings_prefix_timeout_set(prefix, messageId, clientId, channelId, guildId, time_sec, timeout_execute, execute_param_arr) {

    if (prefix_timeouts.has(messageId)) {
        await settings_general_timeout_delete(messageId, clientId);
    };

    //Set timer while add data to database:
    prefix_timeouts.set(messageId, [clientId, setTimeout(() => {
        timeout_execute(execute_param_arr);
        settings_prefix_timeout_delete(messageId, clientId);
    }, (time_sec * 1000))] );
    prefix_client_to_message.set(clientId, [messageId, channelId, guildId]);
    prefix_confirm_collection.set(guildId, prefix);
};

async function settings_prefix_timeout_delete(messageId, clientId, guildId) {
    if(prefix_timeouts.has(messageId)) {
        clearTimeout((prefix_timeouts.get(messageId))[1]);
        prefix_timeouts.delete(messageId);
        prefix_client_to_message.delete(clientId);
        prefix_confirm_collection.delete(guildId);
    };
};

module.exports = { settings_prefix_timeout_set, settings_get_prefix, settings_prefix_is_message_author, settings_prefix_delete_message, settings_prefix_timeout_delete };