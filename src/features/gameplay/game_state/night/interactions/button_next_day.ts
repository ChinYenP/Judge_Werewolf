import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, Collection, EmbedBuilder, Message, StringSelectMenuBuilder } from "discord.js";
import { buttonGameplayNightNextDay } from "../../../../../global/types/interaction_states.js";
import { InteractionModule } from "../../../../../global/types/module.js";
import { is_valid_interaction, timeout_delete, timeout_set } from "../../../../../utility/timeout/timeout.js";
import { get_display_text } from "../../../../../utility/get_display.js";
import { ui_error_fatal, ui_error_non_fatal } from "../../../../../utility/embed/error.js";
import { display_error_str, embed_hex_color, gameplay, timeout_sec } from "../../../../../global/config.js";
import { GAME_MATCH, GameMatchInstance } from "../../../../../global/sqlite_db.js";
import { t_error_code } from "../../../../../global/types/list_str.js";
import { game_result } from "../../global/result.js";
import { isWerewolfRoleId, t_game_match_state } from "../../../../../global/types/other_types.js";
import { i_player_info } from "../../../../../global/types/player_info.js";
import { game_next_state } from "../../../game_logic/next_state.js";
import { get_last_word } from "../../global/get_last_word.js";
import { randomise_array } from "../../../../../utility/randomise_array.js";

const button_night_next_day_interaction: InteractionModule<ButtonInteraction, buttonGameplayNightNextDay> = {
    interaction_name: 'button_gameplay_night_next_day',
    states: {
        next_state: {
            execute: async function (interaction: ButtonInteraction): Promise<void> {
                const clientId: string = interaction.user.id;
                let game_match: GameMatchInstance | null = await GAME_MATCH.findOne({ where: { clientId: clientId } });
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

                let new_players_info: i_player_info[] = game_match.players_info;
                let target_from_to: Collection<number,{ability:number,to:number}[]> = new Collection<number,{ability:number,to:number}[]>();
                let action_description_text: string = '';
                //Some roles might allow multiple targets, this should also resolve any redundant targets.
                for (const action of game_match.status.actions) {
                    const main_target: number = action.target1;
                    const target_to: number = action.target2;
                    let ability_num: number = action.ability;
                    action_description_text += `${String(main_target + 1)}--${String(ability_num + 1)}-->${String(target_to + 1)}\n`
                    if (new_players_info[main_target] === undefined || new_players_info[target_to] === undefined) {
                        console.error('new_players_info[main_target or target_to] is undefined.');
                        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                        await interaction.reply({embeds: [errorEmbed], components: []});
                        return;
                    }
                    //Here we will also resolve any ability num issue.
                    switch (new_players_info[main_target].extra_info.role_id) {
                        case 'G02':
                            if (ability_num > 1) ability_num = 1;
                            if (ability_num === 1 && new_players_info[main_target].extra_info.poison === false) ability_num = 0;
                            break;
                        default:
                            ability_num = 0;
                    }
                    //For now all roles can only have one target.
                    target_from_to.set(main_target, [{ability: ability_num, to: target_to}]);
                }
                //Now then we modify the data based on roles.
                const [last_night_title, died_death_message, safe_death_message, hunter_shot_message, action_title_text]: string[]
                    = await get_display_text(['gameplay.night.logic.last_night_title', 'gameplay.night.logic.death_message.died',
                        'gameplay.night.logic.death_message.safe', 'gameplay.hunter.shot', 'gameplay.night.actions'], clientId);
                let additional_info: string[] = [];
                let werewolf_votes: number[] = [];
                let werewolf_touched: Set<number> = new Set<number>();
                let witch_saving: boolean = false;
                let any_death: boolean = false;
                for (const [from, to] of target_from_to) {
                    if (to[0] === undefined) {
                        console.error('to[0] is undefined.');
                        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                        await interaction.reply({embeds: [errorEmbed], components: []});
                        return;
                    }
                    for (const each_to of to) {
                        const to_index: number = each_to.to;
                        if (new_players_info[to_index] !== undefined && isWerewolfRoleId(new_players_info[to_index].role_id)) {
                            werewolf_touched.add(to_index);
                        }
                    }
                    const first_to: number = to[0].to;
                    const ability_num: number = to[0].ability
                    if (new_players_info[from] === undefined || new_players_info[first_to] === undefined) {
                        console.error('new_players_info[from or first_to] is undefined.');
                        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                        await interaction.reply({embeds: [errorEmbed], components: []});
                        return;
                    }
                    const player_from: i_player_info = new_players_info[from];
                    if (player_from.role_id === 'G00') {
                        if (from !== first_to) {
                            const [seer_result_text, good_text, werewolf_text]: string[]
                                = await get_display_text(['gameplay.night.logic.G00.seer_result', 'gameplay.night.logic.G00.good', 'gameplay.night.logic.G00.werewolf'], clientId);
                            if (isWerewolfRoleId(new_players_info[first_to].role_id)) {
                                additional_info.push(`${seer_result_text}: ${werewolf_text}`);
                            } else {
                                additional_info.push(`${seer_result_text}: ${good_text}`);
                            }
                        }
                    } else if (player_from.extra_info.role_id === 'G01') {
                        if (from === first_to) {
                            player_from.extra_info.target = null;
                        } else {
                            player_from.extra_info.target = first_to;
                        }
                    } else if (player_from.extra_info.role_id === 'G02') {
                        if (ability_num === 0 && player_from.extra_info.heal) {
                            witch_saving = true;
                            player_from.extra_info.heal = false;
                        } else if (ability_num === 1 && player_from.extra_info.poison) {
                            any_death = true;
                            if (new_players_info[first_to] === undefined) {
                                console.error('The player who witch tries to poison to does not exist.');
                                const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                                await interaction.reply({embeds: [errorEmbed], components: []});
                                return;
                            }
                            new_players_info[first_to].dead = true;
                            if (new_players_info[first_to].extra_info.role_id === 'G01') {
                                //Hunter cannot shoot since he is poisoned.
                                new_players_info[first_to].extra_info.witch_poisoned = true;
                            }
                            additional_info.push(`${died_death_message}: ${String(first_to + 1)}`);
                            if (game_match.num_days === 1) {
                                const last_word_obj: {error: true, code: t_error_code} | {error: false, last_word: string}
                                    = await get_last_word(clientId, new_players_info[first_to], first_to + 1);
                                if (last_word_obj.error) {
                                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, last_word_obj.code);
                                    await interaction.reply({embeds: [errorEmbed], components: []});
                                    return;
                                }
                                additional_info.push(last_word_obj.last_word);
                            }
                            player_from.extra_info.poison = false;
                        }
                    } else if (isWerewolfRoleId(player_from.role_id)) {
                        werewolf_votes.push(first_to);
                        werewolf_touched.add(from);
                        //Roles dependent logic
                        //(none yet)
                    }
                }
                //Now do werewolves' fake actions
                for (const index of werewolf_touched) {
                    if (new_players_info[index] === undefined || !isWerewolfRoleId(new_players_info[index].role_id) || !('act' in new_players_info[index].extra_info)) {
                        console.error('Something goes wrong in doing werewolves\' fake actions.');
                        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                        await interaction.reply({embeds: [errorEmbed], components: []});
                        return;
                    }
                    switch (new_players_info[index].extra_info.act) {
                        case 'G00':
                            const [seer_result_text, good_text, werewolf_text]: string[]
                                = await get_display_text(['gameplay.night.logic.G00.seer_result', 'gameplay.night.logic.G00.good', 'gameplay.night.logic.G00.werewolf'], clientId);
                            if (Math.floor(Math.random() * 2) === 0) {
                                additional_info.push(`${seer_result_text}: ${werewolf_text}`);
                            } else {
                                additional_info.push(`${seer_result_text}: ${good_text}`);
                            }
                    }
                }
                //Decide on werewolf killing
                let new_turn_order: t_game_match_state[] = game_match.turn_order;
                let new_consecutive_death: number = game_match.consecutive_no_death;
                if (werewolf_votes.length !== 0) {
                    const random_num: number = Math.floor(Math.random() * werewolf_votes.length);
                    if (werewolf_votes[random_num] === undefined) {
                        console.error('Math.floor(Math.random() * werewolf_votes.length) does not randomly choose correct index.');
                        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                        await interaction.reply({embeds: [errorEmbed], components: []});
                        return;
                    }
                    const killed: number = werewolf_votes[random_num];
                    if (new_players_info[killed] === undefined) {
                        console.error('Math.floor(Math.random() * werewolf_votes.length) does not randomly choose correct index.');
                        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                        await interaction.reply({embeds: [errorEmbed], components: []});
                        return;
                    }
                    if (!witch_saving || (witch_saving && new_players_info[killed].role_id === 'G02')) {
                        any_death = true;
                        new_players_info[killed].dead = true;
                        additional_info.push(`${died_death_message}: ${String(killed + 1)}`);
                        new_consecutive_death = gameplay.consecutive_no_death;
                        if (game_match.num_days === 1) {
                            const last_word_obj: {error: true, code: t_error_code} | {error: false, last_word: string}
                                = await get_last_word(clientId, new_players_info[killed], killed + 1);
                            if (last_word_obj.error) {
                                const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, last_word_obj.code);
                                await interaction.reply({embeds: [errorEmbed], components: []});
                                return;
                            }
                            additional_info.push(last_word_obj.last_word);
                        }
                        //Check if he is a hunter:
                        if (new_players_info[killed].extra_info.role_id === 'G01' && !new_players_info[killed].extra_info.witch_poisoned) {
                            if (new_players_info[killed].extra_info.target !== null && new_players_info[killed].extra_info.target !== killed) {
                                const hunter_target: number = new_players_info[killed].extra_info.target;
                                if (new_players_info[hunter_target] === undefined) {
                                    console.error('The hunter\'s target does not exist.');
                                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                                    await interaction.reply({embeds: [errorEmbed], components: []});
                                    return;
                                }
                                new_players_info[hunter_target].dead = true;
                                additional_info.push(`${died_death_message}: ${String(hunter_target + 1)}`);
                                additional_info.push(`${String(killed + 1)}: ${hunter_shot_message} ${String(hunter_target + 1)}`);
                                if (game_match.num_days === 1) {
                                    const last_word_obj: {error: true, code: t_error_code} | {error: false, last_word: string}
                                        = await get_last_word(clientId, new_players_info[hunter_target], hunter_target + 1);
                                    if (last_word_obj.error) {
                                        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, last_word_obj.code);
                                        await interaction.reply({embeds: [errorEmbed], components: []});
                                        return;
                                    }
                                    additional_info.push(last_word_obj.last_word);
                                }
                            } else {
                                //Let the judge do manual hunter shooting.
                                new_turn_order.push('hunter_night');
                            }
                        }
                    }
                }
                if (!any_death) {
                    additional_info.push(`${safe_death_message}`);
                    new_consecutive_death--;
                }
                new_turn_order.push('day_vote');
                //Create the additional info message
                additional_info = randomise_array<string>(additional_info);
                let night_result_desc: string = '';
                let i: number = 0;
                for (const text of additional_info) {
                    night_result_desc += text;
                    if (i !== additional_info.length - 1) {
                        night_result_desc += '\n';
                    }
                }
                
                //Update database
                const [affectedCountPlayer]: [number] = await GAME_MATCH.update({
                    players_info: new_players_info,
                    turn_order: new_turn_order,
                    consecutive_no_death: new_consecutive_death
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
            timeout_execute: async function(reply_msg: Message, clientId: string, timeout_sec: number, nothing: undefined): Promise<void> {
                nothing;
                timeout_sec;
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