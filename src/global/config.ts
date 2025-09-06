import { t_languages, t_command_cooldown_type, t_timeout_type } from './types/list_str.js';

const display_error_str = "Something has gone wrong during the code runtime: Error DSPY";
const default_prefix = "jw";
const default_language: t_languages = 'eng';
const embed_hex_color = 0x00aaff;
const command_cooldown_sec: Record<t_command_cooldown_type, number> = {
    overall: 1,
    help: 5,
    ping: 5,
    user_settings: 5,
    settings_prefix: 15,
    create: 5,
    prefix: 5,
    game_id: 5,
    gameplay: 5
}
const timeout_sec: Record<t_timeout_type, number> = {
    user_settings: 30,
    settings_prefix: 15,
    create: 30,
    gameplay: 5 * 60
}
const gameplay: Record<string, number> = {
    consecutive_no_death: 3
}

export { display_error_str, default_prefix, default_language, embed_hex_color, command_cooldown_sec, timeout_sec, gameplay }