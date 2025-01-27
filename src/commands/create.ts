import { Message, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { get_display_text } from '../utility/get_display.js';
import { check_cooldown } from '../utility/cooldown.js';
import { general_timeout_set, general_delete_message } from '../utility/timeout/general_timeout.js';
import { isMyClient } from '../declare_type/type_guard.js';
import { config } from '../text_data_config/config.js';

export default {

    name: 'create',
    cooldown_sec: config['cooldown_sec'].create,
    timeout: true,
    timeout_sec: config['timeout_sec'].create.initial,
    async execute(message: Message, args: string[]): Promise<void> {
        console.log(`Create command ran, args: ${args.join(", ")}`);

        const clientId: string = message.author.id;
        if (!isMyClient(message.client)) return;
        if (!await check_cooldown(clientId, this.name, this.cooldown_sec, message.client, message)) {
            return;
        }

        //Check arguments
        if (args.length > 1) {
            //Too much arguments
            const much_args_text: string[] = await get_display_text(['general.command_args_error.much_args'], message.author.id);
            if (much_args_text.length !== 1) {
                console.error('DSPY error at ./commands/create.js, no6');
                await message.reply(config['display_error']);
                return;
            }
            await message.reply(`create${much_args_text[0] ?? config['display_error']}`);
            return;
        }

        //Create by ID
        if (args.length === 1) {
            await message.reply('Create by ID coming soon.');
            return;
        }

        //For general create
        await general_create(message);
    }
}


async function general_create(message: Message): Promise<void> {

    if (!isMyClient(message.client)) return;
    await general_delete_message(message.author.id, 'create', message.client);
    const time_sec: number = config['timeout_sec'].create.initial;
    const display_arr: string[] = await get_display_text(['create.initial', 'create.initial.select_num_player',
        'create.initial.placeholder_preset_custom', 'create.initial.preset', 'create.initial.custom',
        'create.initial.button_next', 'create.initial.button_cancel', 'create.timeout'], message.author.id);

    const rowNumPlayer: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('create_initial_num_player')
                .setPlaceholder(display_arr[1] ?? config['display_error'])
                .addOptions(
                    {
                        label: '6',
                        description: 'Six',
                        value: '6'
                    },
                    {
                        label: '7',
                        description: 'Seven',
                        value: '7'
                    },
                    {
                        label: '8',
                        description: 'Eight',
                        value: '8'
                    },
                    {
                        label: '9',
                        description: 'Nine',
                        value: '9'
                    },
                    {
                        label: '10',
                        description: 'Ten',
                        value: '10'
                    },
                    {
                        label: '11',
                        description: 'Eleven',
                        value: '11'
                    },
                    {
                        label: '12',
                        description: 'Twelve',
                        value: '12'
                    }
                )
        )
    const rowPresetCustom = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('create_initial_preset_custom')
                .setPlaceholder(display_arr[2] ?? config['display_error'])
                .addOptions(
                    {
                        label: display_arr[3] ?? config['display_error'],
                        description: 'Preset',
                        value: 'preset'
                    },
                    {
                        label: display_arr[4] ?? config['display_error'],
                        description: 'Custom',
                        value: 'custom'
                    }
                )
        )
        
    const next_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('create_initial_next')
        .setLabel(display_arr[5] ?? config['display_error'])
        .setStyle(ButtonStyle.Success);

    const cancel_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('create_initial_cancel')
        .setLabel(display_arr[6] ?? config['display_error'])
        .setStyle(ButtonStyle.Secondary);
        
    const rowButton: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(cancel_button, next_button);
    
    const bot_reply: Message = await message.reply({ content: display_arr[0] ?? config['display_error'], components: [rowNumPlayer, rowPresetCustom, rowButton] });
    await general_timeout_set('create', bot_reply.id, message.author.id, message.channelId, time_sec, message_timeout, bot_reply);

    async function message_timeout(bot_reply: Message): Promise<void> {
        const timeout_content: string = `${display_arr[0]?? config['display_error']}\n\n${(display_arr[7] ?? config['display_error']) + time_sec.toString()}s`;
        await bot_reply.edit({ content: timeout_content, components: [] });
    }

}