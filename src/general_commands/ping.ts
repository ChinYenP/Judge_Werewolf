import { check_cooldown } from '../utility/cooldown/check_cooldown.js';
import { ui_cooldown } from '../utility/cooldown/embed.js';
import { get_display_text } from '../utility/get_display.js';
import { command_cooldown_sec, embed_hex_color, display_error_str } from '../global/config.js';
import { Message } from 'discord.js';
import { pingStates } from '../global/types/command_states.js';
import { CommandModule } from '../global/types/module.js';
import { t_cooldown_status } from '../global/types/other_types.js';
import { EmbedBuilder } from 'discord.js';
import { ui_error_fatal } from '../utility/embed/error.js';

const ping_command: CommandModule<pingStates> = {
    command: 'ping',
    states: {
        ping: {
            cooldown_sec: command_cooldown_sec.ping,
            execute: async function (message: Message, _args: string[]): Promise<void> {
                const clientId: string = message.author.id;

                const cooldown_status: t_cooldown_status = await check_cooldown(clientId, 'ping', this.cooldown_sec);
                if (cooldown_status.status == 'cooldown') {
                    await message.reply({ embeds: [await ui_cooldown(clientId, cooldown_status.remaining_sec)], components: [] })
                    return;
                } else if (cooldown_status.status == 'fatal') {
                    await message.reply({ embeds: [await ui_error_fatal(clientId, cooldown_status.error_code)], components: [] })
                    return;
                }

                const [ping_text, pong_text, latency_text, ws_latency_text]: string[]
                    = await get_display_text(['ping.ping', 'ping.pong', 'ping.latency', 'ping.ws_latency'], clientId);

                const pingEmbed: EmbedBuilder = new EmbedBuilder()
                    .setColor(embed_hex_color)
                    .setTitle(ping_text ?? display_error_str)
                    .setTimestamp()

                let sent: Message = await message.reply({ embeds: [pingEmbed], components: [] });
                sent = await sent.fetch();
                const latency: number = sent.createdTimestamp - message.createdTimestamp;

                const pongEmbed: EmbedBuilder = new EmbedBuilder()
                    .setColor(embed_hex_color)
                    .setTitle(`${ping_text ?? display_error_str}${pong_text ?? display_error_str}`)
                    .addFields(
                        {
                            name: latency_text ?? display_error_str,
                            value: `${latency.toString()} ms`
                        },
                        {
                            name: ws_latency_text ?? display_error_str,
                            value: `${message.client.ws.ping.toString()} ms`
                        }
                    )
                    .setTimestamp()

                try {
                    await sent.edit({ embeds: [pongEmbed], components: [] });
                } catch (error) {
                    console.error(error);
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'M1');
                    await message.reply({embeds: [errorEmbed], components: []});
                }
            },
            timeout: false
        }
    },
    entry: async function(message: Message, args: string[]): Promise<void> {
        console.log(`Ping command ran, args: ${args.join(", ")}`);
        await this.states.ping.execute(message, args);
    }
}

export default ping_command;

