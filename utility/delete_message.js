async function delete_message(messageId, channelId, bot_client_instance) {
    try {
        const channel = await bot_client_instance.channels.fetch(channelId);
        const message = await channel.messages.fetch(messageId);
        await message.delete();
    } catch (error) {
        console.error(error);
    };
};

module.exports = { delete_message };