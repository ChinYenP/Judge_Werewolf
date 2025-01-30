import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { get_display_text } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';

async function ui_create_initial(clientId: string, time_sec: number, num_player_selected: number, preset_selected: number)
: Promise<[[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], string, string]> {
    const display_arr: string[] = await get_display_text(['create.initial', 'create.initial.select_num_player',
        'create.initial.placeholder_preset_custom', 'create.initial.preset', 'create.initial.custom',
        'create.initial.button_next', 'create.initial.button_cancel', 'create.timeout'], clientId);

    const rowNumPlayer: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('create_initial_num_player')
                .setPlaceholder(display_arr[1] ?? config['display_error'])
                .addOptions(
                    {
                        label: '6',
                        description: 'Six',
                        value: '6',
                        default: (num_player_selected == 6)
                    },
                    {
                        label: '7',
                        description: 'Seven',
                        value: '7',
                        default: (num_player_selected == 7)
                    },
                    {
                        label: '8',
                        description: 'Eight',
                        value: '8',
                        default: (num_player_selected == 8)
                    },
                    {
                        label: '9',
                        description: 'Nine',
                        value: '9',
                        default: (num_player_selected == 9)
                    },
                    {
                        label: '10',
                        description: 'Ten',
                        value: '10',
                        default: (num_player_selected == 10)
                    },
                    {
                        label: '11',
                        description: 'Eleven',
                        value: '11',
                        default: (num_player_selected == 11)
                    },
                    {
                        label: '12',
                        description: 'Twelve',
                        value: '12',
                        default: (num_player_selected == 12)
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
                        value: 'preset',
                        default: (preset_selected == 1)
                    },
                    {
                        label: display_arr[4] ?? config['display_error'],
                        description: 'Custom',
                        value: 'custom',
                        default: (preset_selected == 0)
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
    
    const content: string = display_arr[0] ?? config['display_error'];
    const timeout_content: string = `${display_arr[0]?? config['display_error']}\n\n${(display_arr[7] ?? config['display_error']) + time_sec.toString()}s`;
    return ([[rowNumPlayer, rowPresetCustom, rowButton], content, timeout_content]);
}

export { ui_create_initial }