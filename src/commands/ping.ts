import { check_cooldown } from '../utility/cooldown.js';
import { get_display_text, get_display_error_code } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';
import { Message } from 'discord.js';
import { isMyClient } from '../declare_type/type_guard.js';
import { EmbedBuilder } from 'discord.js';

export default {

    name: 'ping',
    cooldown_sec: config['cooldown_sec'].ping,
    async execute(message: Message, args: string[]): Promise<void> {
        console.log(`Ping command ran, args: ${args.join(", ")}`);

        const clientId: string = message.author.id;
        if (!isMyClient(message.client)) return;
        if (!await check_cooldown(clientId, this.name, this.cooldown_sec, message.client, message)) {
            return;
        }

        const [ping_text, pong_text, latency_text, ws_latency_text]: string[]
            = await get_display_text(['ping.ping', 'ping.pong', 'ping.latency', 'ping.ws_latency'], message.author.id);

        const pingEmbed = new EmbedBuilder()
            .setColor(config['embed_hex_color'])
            .setTitle(ping_text ?? config['display_error'])
            .setTimestamp()

        let sent: Message = await message.reply({ embeds: [pingEmbed] });
        sent = await sent.fetch();
        const latency: number = sent.createdTimestamp - message.createdTimestamp;

        const pongEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(config['embed_hex_color'])
            .setTitle(`${ping_text ?? config['display_error']}${pong_text ?? config['display_error']}`)
            .addFields(
                {
                    name: latency_text ?? config['display_error'],
                    value: `${latency.toString()} ms`
                },
                {
                    name: ws_latency_text ?? config['display_error'],
                    value: `${message.client.ws.ping.toString()} ms`
                }
            )
            .setTimestamp()
        
        try {
            await sent.edit({ embeds: [pongEmbed] });
        } catch (error) {
            console.error(error);
            await message.reply((await get_display_error_code('M1', message.author.id))[0] ?? config['display_error']);
        }
    }

}