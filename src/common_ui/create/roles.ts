import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
// import { get_display_text } from '../../utility/get_display.js';
// import { config } from '../../text_data_config/config.js';

async function ui_create_roles(clientId: string, time_sec: number, roles_list: string[])
: Promise<[[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], string, string]> {
    console.log('temp:', clientId);

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