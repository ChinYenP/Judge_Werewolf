import { Message, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder } from 'discord.js';
import { get_display_text, get_display_error_code } from '../utility/get_display.js';
import { check_cooldown } from '../utility/cooldown.js';
import { timeout_set, timeout_delete_message } from '../utility/timeout.js';
import { isMyClient } from '../declare_type/type_guard.js';
import { config } from '../text_data_config/config.js';
import { GameCreateInstance, GAME_CREATE } from '../database/sqlite_db.js';
import { ui_create_initial } from '../common_ui/create/initial.js';

export default {

    name: 'create',
    cooldown_sec: config['cooldown_sec'].create,
    timeout: true,
    timeout_sec: config['timeout_sec'].create.initial,
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
            const much_args_text: string[] = await get_display_text(['general.command_args_error.much_args'], message.author.id);
            await message.reply(`create${much_args_text[0] ?? config['display_error']}`);
            return;
        }

        //Create by ID
        if (args.length === 1) {
            await message.reply('Create by ID coming soon.');
            return;
        }

        //For general create
        await general_create(message);
    }
}


async function general_create(message: Message): Promise<void> {

    if (!isMyClient(message.client)) return;
    await timeout_delete_message(message.author.id, 'create', message.client);
    const time_sec: number = config['timeout_sec'].create.initial;

    let num_player_selected: number = -1;
    let preset_selected: number = -1;
    let game_rule_selected: number = -1;
    const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: message.author.id } });

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
                clientId: message.author.id,
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
            await message.reply({content: (await get_display_error_code('D1', message.author.id)) ?? config['display_error'], components: []});
            return;
        }
    }

    const [ActionRowArr, Content, timeout_content]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], string, string]
        = await ui_create_initial(message.author.id, time_sec, num_player_selected, preset_selected, game_rule_selected);
    const bot_reply: Message = await message.reply({ content: Content, components: ActionRowArr });
    await timeout_set('create', bot_reply.id, message.author.id, message.channelId, time_sec, message_timeout, bot_reply);

    async function message_timeout(bot_reply: Message): Promise<void> {
        const settings: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: message.author.id } });
        if (settings !== null) {
            try {
                await GAME_CREATE.destroy({ where: { clientId: message.author.id } });
            } catch (error) {
                console.error(error);
                await message.reply({content: (await get_display_error_code('D2', message.author.id)) ?? config['display_error'], components: []});
                return;
            }
        }
        await bot_reply.edit({ content: timeout_content, components: [] });
    }

}