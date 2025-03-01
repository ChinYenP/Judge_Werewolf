import { Message, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';
import { get_display_text } from '../utility/get_display.js';
import { check_cooldown } from '../utility/cooldown.js';
import { timeout_set, timeout_delete_message } from '../utility/timeout.js';
import { isMyClient, t_role_id } from '../declare_type/type_guard.js';
import { config } from '../text_data_config/config.js';
import { GameCreateInstance, GAME_CREATE } from '../database/sqlite_db.js';
import { ui_create_initial } from '../common_ui/create/initial.js';
import { ui_create_roles } from '../common_ui/create/roles.js';
import { ui_error_non_fatal, ui_error_fatal } from '../common_ui/error.js';
import { ui_invalid_game_id } from '../common_ui/invalid_game_id.js';
import { game_id_validation } from '../utility/validation/game_id_validation.js';

export default {

    name: 'create',
    cooldown_sec: config['cooldown_sec'].create,
    async execute(message: Message, args: string[]): Promise<void> {
        console.log(`Create command ran, args: ${args.join(", ")}`);

        const clientId: string = message.author.id;

        if (!isMyClient(message.client)) return;
        if (!await check_cooldown(clientId, this.name, this.cooldown_sec, message.client, message)) {
            return;
        }

        //Check arguments
        if (args.length > 1) {
            //Too much arguments
            const [much_args_text]: string[] = await get_display_text(['general.command_args_error.much_args'], clientId);
            const much_args_embed: EmbedBuilder = await ui_error_non_fatal(clientId, `create ${much_args_text ?? config['display_error']}`);
            await message.reply({embeds: [much_args_embed], components: []});
            return;
        }

        //Create by ID
        if (args.length === 1) {
            const validate: [boolean, {} | {
                'num_roles_max': number,
                'sheriff': boolean,
                'game_rule': t_game_rule,
                'roles_list': t_role_id[]}] = await game_id_validation(args[0] ?? '');
            if (!(validate[0])) {
                const invalidEmbed: EmbedBuilder = await ui_invalid_game_id(clientId, args[0] ?? '');
                try {
                    await message.reply({ embeds: [invalidEmbed] });
                } catch (error) {
                    console.error(error);
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'M1');
                    await message.reply({embeds: [errorEmbed], components: []});
                }
            } else {
                await create_roles_by_id(message, clientId, config['timeout_sec'].create.roles, validate[1] as {
                    'num_roles_max': number,
                    'sheriff': boolean,
                    'game_rule': t_game_rule,
                    'roles_list': t_role_id[]});
            }
            return;
        }

        //For general create
        await timeout_delete_message(clientId, 'create', message.client);
        const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
        if (settings !== null) {
            if (settings.status === 'roles') {
                if (settings.is_preset === null || settings.num_players === null || settings.game_rule === null
                    || settings.sheriff === null || settings.players_role === null) return;
                await create_roles(message, clientId, config['timeout_sec'].create.roles, settings);
                return;
            }
        }
        await create_initial(message, clientId, config['timeout_sec'].create.initial, settings);
    }
}


async function create_initial(message: Message, clientId: string, time_sec: number, settings: GameCreateInstance | null): Promise<void> {

    if (!isMyClient(message.client)) return;

    let num_player_selected: number = -1;
    let preset_selected: number = -1;
    let game_rule_selected: number = -1;

    if (settings !== null) {
        if (settings.num_players !== null) {
            num_player_selected = settings.num_players;
        }
        if (settings.is_preset !== null) {
            if (settings.is_preset === true) {
                preset_selected = 1;
            } else {
                preset_selected = 0;
            }
        }
        if (settings.game_rule !== null) {
            if (settings.game_rule === 'kill_all') {
                game_rule_selected = 0;
            } else if (settings.game_rule === 'kill_either') {
                game_rule_selected = 1;
            }
        }
    } else {
        try {
            await GAME_CREATE.create({
                clientId: clientId,
                status: 'initial',
                num_players: null,
                is_preset: null,
                sheriff: null,
                players_role: null,
                game_rule: null
            })
        }
        catch (error) {
            console.log(error);
            const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D1');
            await message.reply({embeds: [errorEmbed], components: []});
            return;
        }
    }

    const [ActionRowArr, initialEmbed, timeoutEmbed]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>,
        ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder, EmbedBuilder]
        = await ui_create_initial(clientId, time_sec, num_player_selected, preset_selected, game_rule_selected);
    const bot_reply: Message = await message.reply({ embeds: [initialEmbed], components: ActionRowArr });
    await timeout_set('create', bot_reply.id, clientId, message.channelId, time_sec, message_timeout, bot_reply);

    async function message_timeout(bot_reply: Message): Promise<void> {
        const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
        if (settings !== null) {
            try {
                await GAME_CREATE.destroy({ where: { clientId: clientId } });
            } catch (error) {
                console.error(error);
                const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
                await message.reply({embeds: [errorEmbed], components: []});
                return;
            }
        }
        await bot_reply.edit({ embeds: [initialEmbed, timeoutEmbed], components: [] });
    }
}


async function create_roles_by_id(message: Message, clientId: string, time_sec: number, game_data: {
    'num_roles_max': number,
    'sheriff': boolean,
    'game_rule': t_game_rule,
    'roles_list': t_role_id[]}): Promise<void> {
    
    const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
    if (settings !== null) {
        const [affectedCount] = await GAME_CREATE.update({
            status: 'roles',
            num_players: game_data['num_roles_max'],
            is_preset: false,
            sheriff: game_data['sheriff'],
            players_role: game_data['roles_list'],
            game_rule: game_data['game_rule']
        }, { where: { clientId: clientId } });
        if (affectedCount <= 0) {
            const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D3');
            await message.reply({embeds: [errorEmbed], components: []});
            return;
        }
    } else {
        try {
            await GAME_CREATE.create({
                clientId: clientId,
                status: 'roles',
                num_players: game_data['num_roles_max'],
                is_preset: false,
                sheriff: game_data['sheriff'],
                players_role: game_data['roles_list'],
                game_rule: game_data['game_rule']
            })
        }
        catch (error) {
            console.log(error);
            const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D1');
            await message.reply({embeds: [errorEmbed], components: []});
            return;
        }
    }


    const [ActionRowArr, rolesEmbed, timeoutEmbed]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
        | [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder, EmbedBuilder]
    = await ui_create_roles(clientId, time_sec, game_data['num_roles_max'], game_data['roles_list']);
    const bot_reply: Message = await message.reply({ embeds: [rolesEmbed], components: ActionRowArr });
    await timeout_set('create', bot_reply.id, clientId, message.channelId, time_sec, message_timeout, bot_reply);

    async function message_timeout(bot_reply: Message): Promise<void> {
        const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
        if (settings !== null) {
            try {
                await GAME_CREATE.destroy({ where: { clientId: clientId } });
            } catch (error) {
                console.error(error);
                const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
                await message.reply({embeds: [errorEmbed], components: []});
                return;
            }
        }
        await bot_reply.edit({ embeds: [rolesEmbed, timeoutEmbed], components: [] });
    }
}


async function create_roles(message: Message, clientId: string, time_sec: number, settings: GameCreateInstance): Promise<void> {
    const [ActionRowArr, rolesEmbed, timeoutEmbed]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
        | [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder, EmbedBuilder]
    = await ui_create_roles(clientId, time_sec, settings.num_players as number, []);
    const bot_reply: Message = await message.reply({ embeds: [rolesEmbed], components: ActionRowArr });
    await timeout_set('create', bot_reply.id, clientId, message.channelId, time_sec, message_timeout, bot_reply);

    async function message_timeout(bot_reply: Message): Promise<void> {
        const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
        if (settings !== null) {
            try {
                await GAME_CREATE.destroy({ where: { clientId: clientId } });
            } catch (error) {
                console.error(error);
                const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
                await message.reply({embeds: [errorEmbed], components: []});
                return;
            }
        }
        await bot_reply.edit({ embeds: [rolesEmbed, timeoutEmbed], components: [] });
    }
}