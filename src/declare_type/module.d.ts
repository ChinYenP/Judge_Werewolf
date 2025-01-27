import { Message, Interaction, Client } from 'discord.js';

declare global {
    export type CommandModule = {
        name: string;
        cooldown_sec: number;
        timeout: boolean;
        execute: (message: Message, args: string[]) => Promise<void>;
    } & ( 
        { timeout: true; timeout_sec: number } | 
        { timeout: false; timeout_sec?: never }
    )
    
    export type EventModule = {
        name: string;
        once: boolean;
        async execute: (content: Message | Interaction | Client) => Promise<void>;
    }
}

export {}