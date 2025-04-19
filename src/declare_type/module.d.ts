import { Message, Interaction, Client } from 'discord.js';

declare global {
    export type CommandModule = {
        name: string;
        cooldown_sec: number;
        execute: (message: Message, args: string[]) => Promise<void>;
    }
    
    export type EventModule = {
        name: string;
        once: boolean;
        async execute: (content: Message | Interaction | Client) => Promise<void>;
    }
}