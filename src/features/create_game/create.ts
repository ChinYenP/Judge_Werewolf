
import { ui_invalid_game_id } from '../../utility/embed/invalid_game_id.js';
import { game_id_validation } from '../../utility/validation/game_id_validation.js';

import { Message, ActionRowBuilder, ButtonBuilder, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js';
import { get_display_text } from '../../utility/get_display.js';
import { check_cooldown } from '../../utility/cooldown/check_cooldown.js';
import { ui_cooldown } from '../../utility/cooldown/embed.js';
import { timeout_set, delete_message } from '../../utility/timeout/timeout.js';
import { command_cooldown_sec, display_error_str, timeout_sec } from '../../global/config.js';
import { t_cooldown_status, t_role_id } from '../../global/types/other_types.js';
import { createStates } from '../../global/types/command_states.js';
import { CommandModule } from '../../global/types/module.js';
import { t_game_rule, t_error_code } from '../../global/types/list_str.js';
import { GameCreateInstance, GAME_CREATE } from '../../global/sqlite_db.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../utility/embed/error.js';
import { initial_common_process } from './common_process/initial.js';
import { common_delete_create_timeout } from './common_process/delete_create_timeout.js';
import { roles_common_process } from './common_process/roles.js';
import { final_common_process } from './common_process/final.js';

const create_command: CommandModule<createStates> = {
    command: 'create',
    states: {
        initial: {
            cooldown_sec: 0,
            execute: async function (message: Message, _args: string[]): Promise<void> {
                const clientId: string = message.author.id;

                //Initial process
                const initial_process_obj: {
                    error: false,
                    value: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>,
                    ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
                } | {
                    error: true,
                    code: t_error_code
                } = await initial_common_process(clientId, {replace: 'none'});
                if (initial_process_obj.error) {
                    await message.reply({ embeds: [await ui_error_fatal(clientId, initial_process_obj.code)], components: [] })
                    return;
                }

                //Success
                const [ActionRowArr, initialEmbed]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>,
                    ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
                    = initial_process_obj.value;
                const bot_reply: Message = await message.reply({ embeds: [initialEmbed], components: ActionRowArr });
                timeout_set('create', bot_reply.id, clientId, this.timeout_sec, this.timeout_execute, bot_reply, initialEmbed);
            },
            timeout: true,
            timeout_sec: timeout_sec.create,
            timeout_execute: async function(reply_msg: Message, clientId: string, timeout_sec: number, initialEmbed: EmbedBuilder): Promise<void> {
                const timeoutObj: {embed: EmbedBuilder, error: boolean} = await common_delete_create_timeout(clientId, timeout_sec);
                if (timeoutObj.error) {
                    await reply_msg.reply({embeds: [timeoutObj.embed], components: []});
                    return;
                }
                await reply_msg.edit({ embeds: [initialEmbed, timeoutObj.embed], components: [] });
            }
        },
        roles: {
            cooldown_sec: 0,
            execute: async function (message: Message, _args: string[]): Promise<void> {
                const clientId: string = message.author.id;

                //Roles process
                const roles_process_obj: {
                    error: false,
                    value: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
                        | [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
                } | {
                    error: true,
                    code: t_error_code
                } = await roles_common_process(clientId, {action: 'none'});
                if (roles_process_obj.error) {
                    await message.reply({ embeds: [await ui_error_fatal(clientId, roles_process_obj.code)], components: [] })
                    return;
                }

                //Success
                const [ActionRowArr, rolesEmbed]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
                        | [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
                    = roles_process_obj.value;
                const bot_reply: Message = await message.reply({ embeds: [rolesEmbed], components: ActionRowArr });
                timeout_set('create', bot_reply.id, clientId, this.timeout_sec, this.timeout_execute, bot_reply, rolesEmbed);
            },
            timeout: true,
            timeout_sec: timeout_sec.create,
            timeout_execute: async function(reply_msg: Message, clientId: string, timeout_sec: number, rolesEmbed: EmbedBuilder): Promise<void> {
                const timeoutObj: {embed: EmbedBuilder, error: boolean} = await common_delete_create_timeout(clientId, timeout_sec);
                if (timeoutObj.error) {
                    await reply_msg.reply({embeds: [timeoutObj.embed], components: []});
                    return;
                }
                await reply_msg.edit({ embeds: [rolesEmbed, timeoutObj.embed], components: [] });
            }
        },
        final: {
            cooldown_sec: 0,
            execute: async function (message: Message, _args: string[]): Promise<void> {
                const clientId: string = message.author.id;

                //Final process
                const final_process_obj: {
                    error: false,
                    value: [[ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
                } | {
                    error: true,
                    code: t_error_code
                } = await final_common_process(clientId);
                if (final_process_obj.error) {
                    await message.reply({ embeds: [await ui_error_fatal(clientId, final_process_obj.code)], components: [] })
                    return;
                }

                //Success
                const [ActionRowArr, rolesEmbed]: [[ActionRowBuilder<ButtonBuilder>], EmbedBuilder] = final_process_obj.value;
                const bot_reply: Message = await message.reply({ embeds: [rolesEmbed], components: ActionRowArr });
                timeout_set('create', bot_reply.id, clientId, this.timeout_sec, this.timeout_execute, bot_reply, rolesEmbed);
            },
            timeout: true,
            timeout_sec: timeout_sec.create,
            timeout_execute: async function(reply_msg: Message, clientId: string, timeout_sec: number, finalEmbed: EmbedBuilder): Promise<void> {
                const timeoutObj: {embed: EmbedBuilder, error: boolean} = await common_delete_create_timeout(clientId, timeout_sec);
                if (timeoutObj.error) {
                    await reply_msg.reply({embeds: [timeoutObj.embed], components: []});
                    return;
                }
                await reply_msg.edit({ embeds: [finalEmbed, timeoutObj.embed], components: [] });
            }
        },
        createID: {
            cooldown_sec: 0,
            execute: async function (message: Message, _args: string[]): Promise<void> {
                const clientId: string = message.author.id;

                //If the game has already created, stop new game creation.
                const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
                if (game_create !== null) {
                    const [creating_error_text]: string[] = await get_display_text(['create.creating_error'], clientId);
                    const creating_err_embed: EmbedBuilder = await ui_error_non_fatal(clientId, creating_error_text ?? display_error_str);
                    await message.reply({embeds: [creating_err_embed], components: []});
                    return;
                }
                //Validate the game ID provided.
                const validate: {valid: false, error_msg: string} | {valid: true, datas: {
                    'num_roles_max': number,
                    'sheriff': boolean,
                    'game_rule': t_game_rule,
                    'roles_list': t_role_id[]}} = await game_id_validation(_args[0] ?? '', clientId);
                if (!validate.valid) {
                    const invalidEmbed: EmbedBuilder = await ui_invalid_game_id(clientId, _args[0] ?? '', validate.error_msg);
                    try {
                        await message.reply({ embeds: [invalidEmbed], components: [] });
                    } catch (error) {
                        console.error(error);
                        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'M1');
                        await message.reply({embeds: [errorEmbed], components: []});
                    }
                    return;
                }
                const game_data: {
                    'num_roles_max': number,
                    'sheriff': boolean,
                    'game_rule': t_game_rule,
                    'roles_list': t_role_id[]} = validate.datas;
                
                try {
                    await GAME_CREATE.create({
                        clientId: clientId,
                        status: 'roles',
                        num_players: game_data.num_roles_max,
                        is_preset: false,
                        sheriff: game_data.sheriff,
                        players_role: game_data.roles_list,
                        game_rule: game_data.game_rule
                    })
                }
                catch (error) {
                    console.log(error);
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D1');
                    await message.reply({embeds: [errorEmbed], components: []});
                    return;
                }

                //Same as roles process
                const roles_process_obj: {
                    error: false,
                    value: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
                        | [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
                } | {
                    error: true,
                    code: t_error_code
                } = await roles_common_process(clientId, {action: 'none'});
                if (roles_process_obj.error) {
                    await message.reply({ embeds: [await ui_error_fatal(clientId, roles_process_obj.code)], components: [] })
                    return;
                }

                //Success
                const [ActionRowArr, rolesEmbed]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
                        | [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
                    = roles_process_obj.value;
                const bot_reply: Message = await message.reply({ embeds: [rolesEmbed], components: ActionRowArr });
                timeout_set('create', bot_reply.id, clientId, this.timeout_sec, this.timeout_execute, bot_reply, rolesEmbed);
            },
            timeout: true,
            timeout_sec: timeout_sec.create,
            timeout_execute: async function(reply_msg: Message, clientId: string, timeout_sec: number, rolesEmbed: EmbedBuilder): Promise<void> {
                const timeoutObj: {embed: EmbedBuilder, error: boolean} = await common_delete_create_timeout(clientId, timeout_sec);
                if (timeoutObj.error) {
                    await reply_msg.reply({embeds: [timeoutObj.embed], components: []});
                    return;
                }
                await reply_msg.edit({ embeds: [rolesEmbed, timeoutObj.embed], components: [] });
            }
        }
    },
    entry: async function(message: Message, args: string[]): Promise<void> {
        console.log(`Create command ran, args: ${args.join(", ")}`);
        const clientId: string = message.author.id;
        const cooldown_status: t_cooldown_status = await check_cooldown(clientId, 'create', command_cooldown_sec.create);
        if (cooldown_status.status == 'cooldown') {
            await message.reply({ embeds: [await ui_cooldown(clientId, cooldown_status.remaining_sec)], components: [] })
            return;
        } else if (cooldown_status.status == 'fatal') {
            await message.reply({ embeds: [await ui_error_fatal(clientId, cooldown_status.error_code)], components: [] })
            return;
        }

        //Check arguments
        if (args.length > 1) {
            //Too much arguments
            const [much_args_text]: string[] = await get_display_text(['general.command_args_error.much_args'], clientId);
            const much_args_embed: EmbedBuilder = await ui_error_non_fatal(clientId, `create ${much_args_text ?? display_error_str}`);
            await message.reply({embeds: [much_args_embed], components: []});
            return;
        }

        //Create by ID
        if (args.length === 1) {
            await this.states.createID.execute(message, args);
            return;
        }

        //For general create
        await delete_message(clientId, 'create');
        const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
        if (game_create !== null) {
            if (game_create.status === 'roles') {
                await this.states.roles.execute(message, args);
                return;
            } else if (game_create.status === 'final') {
                await this.states.final.execute(message, args);
                return;
            }
        }
        await this.states.initial.execute(message, args);
    }
}

export default create_command;