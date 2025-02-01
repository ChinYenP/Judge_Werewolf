import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
// import { get_display_text } from '../../utility/get_display.js';
// import { config } from '../../text_data_config/config.js';

async function ui_create_roles(clientId: string, time_sec: number, roles_list: string[])
: Promise<[[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], string, string]> {
    console.log('temp:', clientId);
    // const display_arr: string[] = await get_display_text(['create.initial', 'create.initial.select_num_player',
    //     'create.initial.placeholder_preset_custom', 'create.initial.preset', 'create.initial.custom',
    //     'create.initial.button_next', 'create.initial.button_cancel', 'create.timeout'], clientId);

    // let next_disable: boolean = false;
    // if (!([6,7,8,9,10,11,12].includes(num_player_selected))) next_disable = true;
    // if (!([0,1].includes(preset_selected))) next_disable = true;

    // const rowNumPlayer: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
    //     .addComponents(
    //         new StringSelectMenuBuilder()
    //             .setCustomId('create_initial_num_player')
    //             .setPlaceholder(display_arr[1] ?? config['display_error'])
    //             .addOptions(
    //                 {
    //                     label: '6',
    //                     description: 'Six',
    //                     value: '6',
    //                     default: (num_player_selected == 6)
    //                 },
    //                 {
    //                     label: '7',
    //                     description: 'Seven',
    //                     value: '7',
    //                     default: (num_player_selected == 7)
    //                 },
    //                 {
    //                     label: '8',
    //                     description: 'Eight',
    //                     value: '8',
    //                     default: (num_player_selected == 8)
    //                 },
    //                 {
    //                     label: '9',
    //                     description: 'Nine',
    //                     value: '9',
    //                     default: (num_player_selected == 9)
    //                 },
    //                 {
    //                     label: '10',
    //                     description: 'Ten',
    //                     value: '10',
    //                     default: (num_player_selected == 10)
    //                 },
    //                 {
    //                     label: '11',
    //                     description: 'Eleven',
    //                     value: '11',
    //                     default: (num_player_selected == 11)
    //                 },
    //                 {
    //                     label: '12',
    //                     description: 'Twelve',
    //                     value: '12',
    //                     default: (num_player_selected == 12)
    //                 }
    //             )
    //     )
    // const rowPresetCustom = new ActionRowBuilder<StringSelectMenuBuilder>()
    //     .addComponents(
    //         new StringSelectMenuBuilder()
    //             .setCustomId('create_initial_preset_custom')
    //             .setPlaceholder(display_arr[2] ?? config['display_error'])
    //             .addOptions(
    //                 {
    //                     label: display_arr[3] ?? config['display_error'],
    //                     description: 'Preset',
    //                     value: 'preset',
    //                     default: (preset_selected == 1)
    //                 },
    //                 {
    //                     label: display_arr[4] ?? config['display_error'],
    //                     description: 'Custom',
    //                     value: 'custom',
    //                     default: (preset_selected == 0)
    //                 }
    //             )
    //     )
        
    // const next_button: ButtonBuilder = new ButtonBuilder()
    //     .setCustomId('create_initial_next')
    //     .setLabel(display_arr[5] ?? config['display_error'])
    //     .setStyle(ButtonStyle.Success)
    //     .setDisabled(next_disable);

    // const cancel_button: ButtonBuilder = new ButtonBuilder()
    //     .setCustomId('create_initial_cancel')
    //     .setLabel(display_arr[6] ?? config['display_error'])
    //     .setStyle(ButtonStyle.Secondary);
        
    // const rowButton: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
    //     .addComponents(cancel_button, next_button);
    
    // const content: string = display_arr[0] ?? config['display_error'];
    // const timeout_content: string = `${display_arr[0]?? config['display_error']}\n\n${(display_arr[7] ?? config['display_error']) + time_sec.toString()}s`;
    // return ([[rowNumPlayer, rowPresetCustom, rowButton], content, timeout_content]);



    const rowWerewolf: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('create_roles_werewolf')
                .setPlaceholder('Werewolf Roles')
                .addOptions(
                    {
                        label: 'Werewolf',
                        description: 'A normal werewolf that can vote to kill a player at night.',
                        value: 'W'
                    },
                    {
                        label: 'Snow Werewolf',
                        description: 'A werewolf that can deceive Seer\'s check.',
                        value: 'SW'
                    }
                )
        )
    const rowVillageTeam = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('create_roles_village_team')
                .setPlaceholder('Village Team Roles')
                .addOptions(
                    {
                        label: 'Villager',
                        description: 'A villager with no abilities.',
                        value: 'V'
                    },
                    {
                        label: 'Seer',
                        description: 'A god identity that can check if a player is a werewolf.',
                        value: 'S'
                    },
                    {
                        label: 'Hunter',
                        description: 'A god identity that can shoot a player upon death.',
                        value: 'H'
                    },
                    {
                        label: 'Witch',
                        description: 'A god identity that can save and poison a player.',
                        value: 'W'
                    },
                    {
                        label: 'Guard',
                        description: 'A god identity that can block werewolves\' attack.',
                        value: 'G'
                    }
                )
        )
        const rowDeleteRole: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('create_roles_delete_roles')
                .setPlaceholder('Delete Slot(s): Multiselect')
                .setMinValues(1)
				.setMaxValues(12)
                .addOptions(
                    {
                        label: '1',
                        description: 'One',
                        value: '1'
                    },
                    {
                        label: '2',
                        description: 'Two',
                        value: '2'
                    },
                    {
                        label: '3',
                        description: 'Three',
                        value: '3'
                    },
                    {
                        label: '4',
                        description: 'Four',
                        value: '4'
                    },
                    {
                        label: '5',
                        description: 'Five',
                        value: '5'
                    },
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

    const next_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('create_roles_next')
        .setLabel('Next')
        .setStyle(ButtonStyle.Success)

    const cancel_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('create_cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary);
        
    const rowButton: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(cancel_button, next_button);
    
    let role_list_content: string = '';
    for (let i: number = 0; i < roles_list.length; i++) {
        role_list_content += `${String(i+1)}. ${roles_list[i]}`;
    }
    const content: string = 'Select the roles below to add it into role list.\nCurrent role list:\n\n' + role_list_content;
    const timeout_content: string = `${content}\n\n${('Game creation timeout: ') + time_sec.toString()}s`;
    return ([[rowWerewolf, rowVillageTeam, rowDeleteRole, rowButton], content, timeout_content]);
}

export { ui_create_roles }