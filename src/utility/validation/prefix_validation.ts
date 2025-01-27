//You should not fail this normally...
async function prefix_validation(prefix: string): Promise<boolean> {
    const allow_characters: string = process.env.ALLOWED_PREFIX_CHARACTERS;
    const prefix_length: number = prefix.length;
    if (prefix_length < 1 || prefix_length > 5) {
        return (false);
    }
    for (let i = 0; i < prefix_length; i++) {
        if (!(allow_characters.includes(prefix))) {
            return (false);
        }
    }
    return (true);
}

export { prefix_validation }