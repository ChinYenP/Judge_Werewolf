import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder } from "discord.js";
import { GameMatchInstance, GAME_MATCH } from '../../../database/sqlite_db.js';
import { get_display_text, get_display_error_code } from '../../../utility/get_display.js';



async function game_night(clientId: string, info_embed: EmbedBuilder): Promise<void> {
    
    // Add day time to 
    // Call result.ts function to end the game at timeout
}


async function ui_night(clientId: string, time_sec: number)
: Promise<[[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>,
    ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder, EmbedBuilder]> {
    
    const [title_text, num_player_title_text, num_player_desc_text, preset_custom_title_text,
        preset_custom_desc_text, game_rule_title_text, game_rule_desc_text, select_num_player_text,
        placeholder_preset_custom_text, preset_text, custom_text, button_next_text, button_cancel_text,
        timeout_text, placeholder_game_rule_text, kill_all_text, kill_either_text]: string[]
        = await get_display_text(['create.initial.embed.title', 'create.initial.embed.num_player.title',
        'create.initial.embed.num_player.description', 'create.initial.embed.preset_custom.title',
        'create.initial.embed.preset_custom.description', 'create.initial.embed.game_rule.title',
        'create.initial.embed.game_rule.description', 'create.initial.select_num_player',
        'create.initial.placeholder_preset_custom', 'create.initial.preset', 'create.initial.custom',
        'create.button_next', 'create.button_cancel', 'create.timeout',
        'create.initial.placeholder_game_rule', 'create.initial.kill_all',
        'create.initial.kill_either'], clientId);

    let next_disable: boolean = false;
    if (!([6,7,8,9,10,11,12].includes(num_player_selected))) next_disable = true;
    if (!([0,1].includes(preset_selected))) next_disable = true;
    if (!([0,1].includes(game_rule_selected))) next_disable = true;

    const rowNumPlayer: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('create_initial_num_player')
                .setPlaceholder(select_num_player_text ?? config['display_error'])
                .addOptions(
                    {
                        label: '6',
                        description: 'Six',
                        value: '6',
                        default: (num_player_selected === 6)
                    },
                    {
                        label: '7',
                        description: 'Seven',
                        value: '7',
                        default: (num_player_selected === 7)
                    },
                    {
                        label: '8',
                        description: 'Eight',
                        value: '8',
                        default: (num_player_selected === 8)
                    },
                    {
                        label: '9',
                        description: 'Nine',
                        value: '9',
                        default: (num_player_selected === 9)
                    },
                    {
                        label: '10',
                        description: 'Ten',
                        value: '10',
                        default: (num_player_selected === 10)
                    },
                    {
                        label: '11',
                        description: 'Eleven',
                        value: '11',
                        default: (num_player_selected === 11)
                    },
                    {
                        label: '12',
                        description: 'Twelve',
                        value: '12',
                        default: (num_player_selected === 12)
                    }
                )
        )
    const rowPresetCustom = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('create_initial_preset_custom')
                .setPlaceholder(placeholder_preset_custom_text ?? config['display_error'])
                .addOptions(
                    {
                        label: preset_text ?? config['display_error'],
                        description: 'Preset',
                        value: 'preset',
                        default: (preset_selected === 1)
                    },
                    {
                        label: custom_text ?? config['display_error'],
                        description: 'Custom',
                        value: 'custom',
                        default: (preset_selected === 0)
                    }
                )
        )
        const rowGameRule = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('create_initial_game_rule')
                .setPlaceholder(placeholder_game_rule_text ?? config['display_error'])
                .addOptions(
                    {
                        label: kill_all_text ?? config['display_error'],
                        description: 'Kill All',
                        value: 'kill_all',
                        default: (game_rule_selected === 0)
                    },
                    {
                        label: kill_either_text ?? config['display_error'],
                        description: 'Kill Either',
                        value: 'kill_either',
                        default: (game_rule_selected === 1)
                    }
                )
        )
        
    const next_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('create_initial_next')
        .setLabel(button_next_text ?? config['display_error'])
        .setStyle(ButtonStyle.Success)
        .setDisabled(next_disable);

    const cancel_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('create_cancel')
        .setLabel(button_cancel_text ?? config['display_error'])
        .setStyle(ButtonStyle.Secondary);
        
    const rowButton: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(cancel_button, next_button);
    
    const initialEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(config['embed_hex_color'])
        .setTitle(title_text ?? config['display_error'])
        .addFields(
            {
                name: num_player_title_text ?? config['display_error'],
                value: num_player_desc_text ?? config['display_error']
            },
            {
                name: preset_custom_title_text ?? config['display_error'],
                value: preset_custom_desc_text ?? config['display_error']
            },
            {
                name: game_rule_title_text ?? config['display_error'],
                value: game_rule_desc_text ?? config['display_error']
            }
        )
        .setTimestamp()
        
    return ([[rowNumPlayer, rowPresetCustom, rowGameRule, rowButton], initialEmbed, (await ui_timeout(clientId, time_sec, timeout_text ?? config['display_error']))]);
}

export { game_night }