import { EmbedBuilder } from 'discord.js';
import { GameCreateInstance, GAME_CREATE } from '../../../global/sqlite_db.js';
import { get_display_text } from '../../../utility/get_display.js';
import { ui_timeout } from '../../../utility/timeout/embed.js';
import { display_error_str } from '../../../global/config.js';
import { ui_error_fatal } from '../../../utility/embed/error.js';

async function common_delete_create_timeout(clientId: string, timeout_sec: number): Promise<{embed: EmbedBuilder, error: boolean}> {
    const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
    if (game_create !== null) {
        try {
            await GAME_CREATE.destroy({ where: { clientId: clientId } });
        } catch (error) {
            console.error(error);
            const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
            return ({embed: errorEmbed, error: true});
        }
    }
    const [timeout_text]: string[] = await get_display_text(['create.timeout'], clientId);
    const timeoutEmbed: EmbedBuilder = await ui_timeout(clientId, timeout_sec, timeout_text ?? display_error_str);
    return ({embed: timeoutEmbed, error: false});
}

export { common_delete_create_timeout };