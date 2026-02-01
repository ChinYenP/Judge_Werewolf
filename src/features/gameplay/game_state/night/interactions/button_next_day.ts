import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, EmbedBuilder, Message, StringSelectMenuBuilder } from "discord.js";
import { buttonGameplayNightNextDay } from "../../../../../global/types/interaction_states.js";
import { InteractionModule } from "../../../../../global/types/module.js";
import { is_valid_interaction, timeout_delete, timeout_set } from "../../../../../utility/timeout/timeout.js";
import { get_display_text } from "../../../../../utility/get_display.js";
import { ui_error_fatal, ui_error_non_fatal } from "../../../../../utility/embed/error.js";
import { display_error_str, embed_hex_color, timeout_sec } from "../../../../../global/config.js";
import { GAME_MATCH, GameMatchInstance } from "../../../../../global/sqlite_db.js";
import { t_error_code } from "../../../../../global/types/list_str.js";
import { game_result } from "../../global/result.js";
import { i_player_info } from "../../../../../global/types/player_info.js";
import { game_next_state } from "../../../game_logic/next_state.js";
import { get_last_word } from "../../global/get_last_word.js";
import { randomise_array } from "../../../../../utility/randomise_array.js";
import { NightResolutionResult, resolve_night_phase } from "../logic.js";

const button_night_next_day_interaction: InteractionModule<ButtonInteraction, buttonGameplayNightNextDay> = {
    interaction_name: 'button_gameplay_night_next_day',
    states: {
        next_state: {
            execute: async function (interaction: ButtonInteraction): Promise<void> {
                const clientId: string = interaction.user.id;
                const game_match: GameMatchInstance | null = await GAME_MATCH.findOne({ where: { clientId: clientId } });
                if (game_match === null) {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D4');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }
                if (game_match.status.status !== 'night') {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }

                let action_description_text: string = '';
                for (const action of game_match.status.actions) {
                    const main_target: number = action.target1;
                    const target_to: number = action.target2;
                    const ability_num: number = action.ability;
                    action_description_text += `${String(main_target + 1)}--${String(ability_num + 1)}-->${String(target_to + 1)}\n`
                }
                
                const night_result: NightResolutionResult | 'error' = resolve_night_phase(game_match.players_info, game_match.status.actions, game_match.turn_order, game_match.consecutive_no_death, game_match.num_days);
                if (night_result === 'error') {
                    console.error('Something goes wrong in game logic.');
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }
                //Create the additional info message
                const [last_night_title, died_death_message, safe_death_message, hunter_shot_message, action_title_text,
                    seer_result_text, seer_good_text, seer_werewolf_text]: string[]
                    = await get_display_text(['gameplay.night.logic.last_night_title', 'gameplay.night.logic.death_message.died',
                        'gameplay.night.logic.death_message.safe', 'gameplay.hunter.shot', 'gameplay.night.actions',
                        'gameplay.night.logic.G00.seer_result', 'gameplay.night.logic.G00.good', 'gameplay.night.logic.G00.werewolf'], clientId);
                let additional_info: string[] = [];
                for (const additional_msg of night_result.additional_msg) {
                    switch (additional_msg.type) {
                        case 'death':
                            additional_info.push(`${died_death_message ?? display_error_str}: ${String(additional_msg.targetIndex + 1)}`);
                            break;
                        case 'hunter_shot':
                            additional_info.push(`${String(additional_msg.shooterIndex + 1)}: ${hunter_shot_message ?? display_error_str} ${String(additional_msg.targetIndex + 1)}`);
                            break;
                        case 'last_word': {
                            const dead_player: i_player_info | undefined = game_match.players_info[additional_msg.targetIndex];
                            if (dead_player === undefined) {
                                const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                                await interaction.reply({embeds: [errorEmbed], components: []});
                                return;
                            }
                            const last_word_obj: { error: false, last_word: string } | { error: true, code: t_error_code}
                                = await get_last_word(clientId, dead_player, additional_msg.targetIndex + 1);
                            if (last_word_obj.error) {
                                const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, last_word_obj.code);
                                await interaction.reply({embeds: [errorEmbed], components: []});
                                return;
                            }
                            additional_info.push(last_word_obj.last_word);
                            break;
                        }
                        case 'no_deaths':
                            additional_info.push(safe_death_message ?? display_error_str);
                            break;
                        case 'seer_check':
                            if (additional_msg.isWerewolf) {
                                additional_info.push(`${seer_result_text ?? display_error_str}: ${seer_werewolf_text ?? display_error_str}`);
                            } else {
                                additional_info.push(`${seer_result_text ?? display_error_str}: ${seer_good_text ?? display_error_str}`);
                            }
                            break;
                    }
                }
                additional_info = randomise_array<string>(additional_info);
                let night_result_desc: string = '';
                const i: number = 0;
                for (const text of additional_info) {
                    night_result_desc += text;
                    if (i !== additional_info.length - 1) {
                        night_result_desc += '\n';
                    }
                }
                
                //Update database
                const [affectedCountPlayer]: [number] = await GAME_MATCH.update({
                    players_info: night_result.new_players_info,
                    turn_order: night_result.new_turn_order,
                    consecutive_no_death: night_result.new_consecutive_death
                }, { where: { clientId: clientId } });
                if (affectedCountPlayer <= 0) {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D3');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }

                //Create an embed for this night result.
                const nightResultEmbed: EmbedBuilder = new EmbedBuilder()
                    .setColor(embed_hex_color)
                    .setTitle(last_night_title ?? display_error_str)
                    .setDescription(night_result_desc)
                    .addFields(
                        {
                            name: action_title_text ?? display_error_str,
                            value: action_description_text
                        }
                    )
                    .setTimestamp()
                
                const gameUIObj: {error: true, code: t_error_code} |
                    {error: false, end: false, infoEmbed: EmbedBuilder, prevStateEmbed: EmbedBuilder | null, stateEmbed: EmbedBuilder, components: (ActionRowBuilder<StringSelectMenuBuilder> | ActionRowBuilder<ButtonBuilder>)[]} |
                    {error: false, end: true, prevStateEmbed: EmbedBuilder | null, resultEmbed: EmbedBuilder}
                    = await game_next_state(clientId, nightResultEmbed);
                if (gameUIObj.error) {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, gameUIObj.code);
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }
                if (gameUIObj.prevStateEmbed === null) {
                    console.error('Logically, prevState should exist since it is the nightResultEmbed.');
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }
                if (gameUIObj.end) {
                    await interaction.update({embeds: [gameUIObj.prevStateEmbed], components: []});
                    await interaction.followUp({embeds: [gameUIObj.resultEmbed], components: []});
                    timeout_delete(clientId, 'gameplay');
                    return;
                }
                await interaction.update({embeds: [gameUIObj.prevStateEmbed], components: []});
                const update_msg: Message = await interaction.followUp({embeds: [gameUIObj.infoEmbed, gameUIObj.stateEmbed], components: gameUIObj.components});
                timeout_set('gameplay', update_msg.id, clientId, this.timeout_sec, this.timeout_execute, update_msg, undefined);
            },
            timeout: true,
            timeout_sec: timeout_sec.gameplay,
            timeout_execute: async function(reply_msg: Message, clientId: string, _timeout_sec: number, _nothing: undefined): Promise<void> {
                const gameUIObj: {error: true, code: t_error_code} |
                    {error: false, end: true, prevStateEmbed: EmbedBuilder | null, resultEmbed: EmbedBuilder}
                    = await game_result(clientId, 'timeout', null);
                if (gameUIObj.error) {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, gameUIObj.code);
                    await reply_msg.edit({embeds: [errorEmbed], components: []});
                    return;
                }
                await reply_msg.edit({ embeds: [gameUIObj.resultEmbed], components: [] });
            }
        }
    },
    entry: async function(interaction: ButtonInteraction): Promise<void> {
        console.log('interaction run: button_gameplay_night_next_day');
        const clientId: string = interaction.user.id;
        const messageId: string = interaction.message.id;

        const interaction_check: {
            valid: true
        } | {
            valid: false,
            type: 'outdated' | 'not_owner'
        } = is_valid_interaction(messageId, clientId);

        if (!interaction_check.valid) {
            if (interaction_check.type === 'outdated') {
                const [outdated_interaction_text]: string[] = await get_display_text(['general.outdated_interaction'], clientId);
                const outdated_embed: EmbedBuilder = await ui_error_non_fatal(clientId, outdated_interaction_text ?? display_error_str);
                await interaction.update({embeds: [outdated_embed], components: []});
            }
            return;
        }
        await this.states.next_state.execute(interaction);
    }
}

export default button_night_next_day_interaction;