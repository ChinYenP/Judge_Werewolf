import { is_valid_interaction, timeout_delete, timeout_set } from '../../../../utility/timeout/timeout.js';
import { get_display_text, get_role_list_order } from '../../../../utility/get_display.js';
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, EmbedBuilder, Message, StringSelectMenuBuilder } from 'discord.js';
import { display_error_str, gameplay, timeout_sec } from '../../../../global/config.js';
import { GameCreateInstance, GAME_CREATE, GAME_MATCH } from '../../../../global/sqlite_db.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../../../utility/embed/error.js';
import { InteractionModule } from '../../../../global/types/module.js';
import { buttonCreateFinalStartGame } from '../../../../global/types/interaction_states.js';
import { win_condition_in_role } from '../../../gameplay/game_logic/win_condition.js';
import { isFakeRoleId, t_fake_role_id } from '../../../../global/types/other_types.js';
import { compareRoleId } from '../../../../utility/compareFn.js';
import { start_num_ability, start_players_info, start_turn_order } from '../../../gameplay/game_logic/start_settings.js';
import { game_next_state } from '../../../gameplay/game_logic/next_state.js';
import { t_error_code } from '../../../../global/types/list_str.js';
import { game_result } from '../../../gameplay/game_state/global/result.js';

const button_start_game_interaction: InteractionModule<ButtonInteraction, buttonCreateFinalStartGame> = {
    interaction_name: 'button_create_final_start_game',
    states: {
        start_game: {
            execute: async function (interaction: ButtonInteraction): Promise<void> {
                const clientId: string = interaction.user.id;

                const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });

                if (game_create === null
                    || game_create.is_preset === null || game_create.num_players === null || game_create.game_rule === null
                    || game_create.sheriff === null || game_create.players_role?.length !== game_create.num_players
                    || win_condition_in_role(game_create.players_role, game_create.game_rule) !== 'unknown'
                ) {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }

                const fake_role_list: t_fake_role_id[] = [];
                for (const each_role_id of game_create.players_role) {
                    if (isFakeRoleId(each_role_id) && !fake_role_list.includes(each_role_id)) {
                        fake_role_list.push(each_role_id);
                    }
                }

                //Destroy game_create
                try {
                    await GAME_CREATE.destroy({ where: { clientId: clientId } });
                } catch (error) {
                    console.error(error);
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }

                //Create game_match
                try {
                    await GAME_MATCH.create({
                        clientId: clientId,
                        status: {status: 'night', selecting: { target1: null, target2: null, ability: null }, actions: []},
                        turn_order: await start_turn_order(game_create.players_role),
                        num_days: 0,
                        sheriff: game_create.sheriff,
                        game_rule: game_create.game_rule,
                        consecutive_no_death: gameplay.consecutive_no_death,
                        num_ability: await start_num_ability(game_create.players_role),
                        role_count: get_role_list_order(game_create.players_role),
                        fake_role_list: fake_role_list.sort(compareRoleId),
                        players_info: await start_players_info(game_create.players_role, fake_role_list)
                    })
                }
                catch (error) {
                    console.log(error);
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D1');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }

                const gameUIObj: {error: true, code: t_error_code} |
                    {error: false, end: false, infoEmbed: EmbedBuilder, prevStateEmbed: EmbedBuilder | null, stateEmbed: EmbedBuilder, components: (ActionRowBuilder<StringSelectMenuBuilder> | ActionRowBuilder<ButtonBuilder>)[]} |
                    {error: false, end: true, prevStateEmbed: EmbedBuilder | null, resultEmbed: EmbedBuilder}
                    = await game_next_state(clientId, null);
                if (gameUIObj.error) {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, gameUIObj.code);
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }
                if (gameUIObj.end) {
                    console.error('The game cannot end the moment it begins.');
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }
                if (gameUIObj.prevStateEmbed !== null) {
                    console.error('The game cannot have a previous state embed the moment it begins.');
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }
                timeout_delete(clientId, 'create');
                await interaction.update({embeds: [gameUIObj.infoEmbed, gameUIObj.stateEmbed], components: gameUIObj.components});
                const update_msg: Message = await interaction.fetchReply();
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
        console.log('interaction run: button_create_final_start_game');
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
        await this.states.start_game.execute(interaction);
    }
}

export default button_start_game_interaction;