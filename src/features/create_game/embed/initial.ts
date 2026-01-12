import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { get_display_text } from '../../../utility/get_display.js';
import { display_error_str, embed_hex_color } from '../../../global/config.js';
import { t_game_rule, t_interaction_name, isNumPlayer } from '../../../global/types/list_str.js';

async function ui_create_initial(clientId: string, num_player_selected: number | null, preset_selected: boolean | null, game_rule_selected: t_game_rule | null)
: Promise<[[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>,
    ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder]> {
    
    const [title_text, num_player_title_text, num_player_desc_text, preset_custom_title_text,
        preset_custom_desc_text, game_rule_title_text, game_rule_desc_text, select_num_player_text,
        placeholder_preset_custom_text, preset_text, custom_text, button_next_text, button_cancel_text,
        placeholder_game_rule_text, kill_all_text, kill_either_text]: string[]
        = await get_display_text(['create.initial.embed.title', 'create.initial.embed.num_player.title',
        'create.initial.embed.num_player.description', 'create.initial.embed.preset_custom.title',
        'create.initial.embed.preset_custom.description', 'create.initial.embed.game_rule.title',
        'create.initial.embed.game_rule.description', 'create.initial.select_num_player',
        'create.initial.placeholder_preset_custom', 'create.initial.preset', 'create.initial.custom',
        'create.button_next', 'create.button_cancel',
        'create.initial.placeholder_game_rule', 'create.initial.kill_all',
        'create.initial.kill_either'], clientId);

    let next_disable: boolean = false;
    if (num_player_selected === null || !isNumPlayer(String(num_player_selected))) next_disable = true;
    if (preset_selected === null) next_disable = true;
    if (game_rule_selected === null) next_disable = true;

    const rowNumPlayer: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_create_initial_num_player' satisfies t_interaction_name)
                .setPlaceholder(select_num_player_text ?? display_error_str)
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
    const rowPresetCustom: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_create_initial_preset_custom' satisfies t_interaction_name)
                .setPlaceholder(placeholder_preset_custom_text ?? display_error_str)
                .addOptions(
                    {
                        label: preset_text ?? display_error_str,
                        description: 'Preset',
                        value: 'preset',
                        default: (preset_selected === true)
                    },
                    {
                        label: custom_text ?? display_error_str,
                        description: 'Custom',
                        value: 'custom',
                        default: (preset_selected === false)
                    }
                )
        )
        const rowGameRule: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_create_initial_game_rule' satisfies t_interaction_name)
                .setPlaceholder(placeholder_game_rule_text ?? display_error_str)
                .addOptions(
                    {
                        label: kill_all_text ?? display_error_str,
                        description: 'Kill All',
                        value: 'kill_all',
                        default: (game_rule_selected === 'kill_all')
                    },
                    {
                        label: kill_either_text ?? display_error_str,
                        description: 'Kill Either',
                        value: 'kill_either',
                        default: (game_rule_selected === 'kill_either')
                    }
                )
        )
        
    const next_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('button_create_initial_next' satisfies t_interaction_name)
        .setLabel(button_next_text ?? display_error_str)
        .setStyle(ButtonStyle.Success)
        .setDisabled(next_disable);

    const cancel_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('button_create_cancel' satisfies t_interaction_name)
        .setLabel(button_cancel_text ?? display_error_str)
        .setStyle(ButtonStyle.Secondary);
        
    const rowButton: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(cancel_button, next_button);
    
    const initialEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(embed_hex_color)
        .setTitle(title_text ?? display_error_str)
        .addFields(
            {
                name: num_player_title_text ?? display_error_str,
                value: num_player_desc_text ?? display_error_str
            },
            {
                name: preset_custom_title_text ?? display_error_str,
                value: preset_custom_desc_text ?? display_error_str
            },
            {
                name: game_rule_title_text ?? display_error_str,
                value: game_rule_desc_text ?? display_error_str
            }
        )
        .setTimestamp()
        
    return ([[rowNumPlayer, rowPresetCustom, rowGameRule, rowButton], initialEmbed]);
}

export { ui_create_initial }