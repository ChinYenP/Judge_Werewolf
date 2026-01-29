import { t_languages, languages_list } from './list_str.js';
import { default_language } from '../config.js';

export type DisplayTestUnit = {
    eng: string;
} & Partial<Record<Exclude<t_languages, 'eng'>, string>>;

export function isDisplayTestUnit(value: Record<string, unknown>): value is DisplayTestUnit {
    if (typeof value[default_language] !== 'string') return (false);
    for (const key of languages_list) {
        if (key === default_language) continue;
        if (key in value && typeof value[key] !== 'string') {
            return (false);
        }
    }
    return (true);
}

export interface DisplayTextType {
    [key: string]: DisplayTextType | DisplayTestUnit;
}

export function isDisplayText(value: unknown): value is DisplayTextType {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return (false);
    }
    const entry: Record<string, unknown> = value as Record<string, unknown>;
    // Check if it is a unit
    if (isDisplayTestUnit(entry)) {
        return (true);
    }
    for (const key of Object.keys(entry)) {
        const child: unknown = (entry)[key];
        if (typeof child !== 'object' || child === null || Array.isArray(child)) {
            return (false);
        }
        // Recurse
        if (!isDisplayText(child)) {
            return (false);
        }
    }
    return (true);
}