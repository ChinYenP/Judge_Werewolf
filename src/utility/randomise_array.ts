export function randomise_array<T>(array: readonly T[]): T[] {
    const result: T[] = array.slice();
    for (let i: number = result.length - 1; i > 0; i--) {
        const j: number = Math.floor(Math.random() * (i + 1));
        const a: T | undefined = result[i];
        const b: T | undefined = result[j];
        if (a === undefined || b === undefined) continue;
        result[i] = b;
        result[j] = a;
    }
    return result;
}