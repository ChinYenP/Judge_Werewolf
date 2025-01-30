import { StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, Message, InteractionCallbackResource } from 'discord.js';
import { GameCreateInstance, GAME_CREATE } from '../../database/sqlite_db.js';
import { general_is_outdated, general_timeout_set, general_is_message_author } from '../../utility/timeout.js';
import { get_display_text, get_display_error_code } from '../../utility/get_display.js';
import { config } from '../../text_data_config/config.js';

async function select_create_initial_num_player(interaction: StringSelectMenuInteraction): Promise<void> {
    
    if (!(await general_is_message_author(interaction.message.id, interaction.user.id))) {
        return;
    }

    console.log('create_initial: select_num_player');

    if (await general_is_outdated(interaction.message.id)) {
        const outdated_interaction_text: string[] = await get_display_text(['general.outdated_interaction'], interaction.user.id);
        if (outdated_interaction_text.length !== 1) {
            console.error('DSPY error at ./utility/create_initial/select_num_player.js, no1');
            await interaction.update({ content: config['display_error'], components: [] });
            return;
        }
        await interaction.update({ content: outdated_interaction_text[0] ?? config['display_error'], components: [] });
        return;
    }

    let display_arr: string[] = [];

    if (interaction.values[0] === undefined) return;
    if (!(['6', '7', '8', '9', '10', '11', '12'].includes(interaction.values[0]))) return;
    const new_num_player: number = parseInt(interaction.values[0]);

    //Do sequelize thing here while get output text
    let num_player_selected: number = -1;
    let preset_selected: number = -1;
    const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: interaction.user.id } });

    if (settings !== null) {
        //Update first
        const [affectedCount] = await GAME_CREATE.update({ num_players: new_num_player }, { where: { clientId: interaction.user.id } });
        if (affectedCount <= 0) {
            const display_arr: string[] = await get_display_error_code('D3', interaction.user.id);
            if (display_arr.length !== 1) {
                console.error('DSPY error at ./utility/create_initial/select_num_player.js, no2');
                await interaction.message.edit({content: config['display_error'], components: []});
                return;
            }
            console.error(`D3 error at ./utility/create_initial/select_num_player.js, no3`);
            await interaction.update({content: display_arr[0] ?? config['display_error'], components: []});
            return;
        }
        //Set default selection
        num_player_selected = new_num_player;
        if (settings.is_preset !== null) {
            if (settings.is_preset == true) {
                preset_selected = 1;
            } else {
                preset_selected = 0;
            }
        }
    } else {
        try {
            await GAME_CREATE.create({
                clientId: interaction.user.id,
                status: 'initial',
                num_players: new_num_player,
                is_preset: null,
                sheriff: null,
                players_role: null
            })
        }
        catch (error) {
            console.log(error);
            const display_arr: string[] = await get_display_error_code('D1', interaction.user.id);
            if (display_arr.length !== 1) {
                console.error('DSPY error at ./utility/create_initial/select_num_player.js, no4');
                await interaction.update({content: config['display_error'], components: []});
                return;
            }
            console.error(`D3 error at ./utility/create_initial/select_num_player.js, no5`);
            await interaction.update({content: display_arr[0] ?? config['display_error'], components: []});
            return;
        }
    }

    //Success
    const time_sec: number = config['timeout_sec'].create.initial;
    display_arr = await get_display_text(['create.initial', 'create.initial.select_num_player',
        'create.initial.placeholder_preset_custom', 'create.initial.preset', 'create.initial.custom',
        'create.initial.button_next', 'create.initial.button_cancel', 'create.timeout'], interaction.user.id);

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
    
    const update_msg_resource: InteractionCallbackResource = (await interaction.update({ content: display_arr[0] ?? config['display_error'], components: [rowNumPlayer, rowPresetCustom, rowButton], withResponse: true })).resource as InteractionCallbackResource;
    const update_msg: Message = update_msg_resource.message as Message;
    await general_timeout_set('create', update_msg.id, interaction.user.id, update_msg.channelId, time_sec, message_timeout, update_msg);

    async function message_timeout(update_msg: Message): Promise<void> {
        const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: interaction.user.id } });
        if (settings !== null) {
            try {
                await GAME_CREATE.destroy({ where: { clientId: interaction.user.id } });
            } catch (error) {
                console.error(error);
                const display_arr: string[] = await get_display_error_code('D2', interaction.user.id);
                if (display_arr.length !== 1) {
                    console.error('DSPY error at ./utility/create_initial/select_num_player.js, no6');
                    await update_msg.edit({content: config['display_error'], components: []});
                    return;
                }
                console.error(`D3 error at ./utility/create_initial/select_num_player.js, no7`);
                await update_msg.edit({content: display_arr[0] ?? config['display_error'], components: []});
                return;
            }
        }
        const timeout_content = `${display_arr[0]?? config['display_error']}\n\n${(display_arr[7] ?? config['display_error']) + time_sec.toString()}s`;
        await update_msg.edit({ content: `${timeout_content + time_sec }s`, components: [] });
    }
}

export { select_create_initial_num_player }