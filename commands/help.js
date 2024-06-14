const { get_display_text } = require('../utility/get_display/get_display_text.js');

module.exports = {

    name: 'help',
    async execute(message, args) {
        console.log(`Help command ran, args: ${args}`);

        const display_arr = await get_display_text(['help'], message.author.id);
        if (display_arr.length !== 1) {
            await message.reply('Something went wrong during retrieving text.');
            return;
        };
        const text = display_arr[0];

        await message.reply(text);
    },

};