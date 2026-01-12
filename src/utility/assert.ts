export function assertCharIndex(str: string, index: number): string {
    assertNotNull<string>(str[index]);
    const c: string = str[index];
    return (c);
}

export function assertNotNull<T>(value: T | null | undefined): asserts value is NonNullable<T> {
    if (value === null || value === undefined) {
        throw new Error(`Value must not be null or undefined.`);
    }
}