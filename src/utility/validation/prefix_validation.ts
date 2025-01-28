//You should not fail this normally...
async function prefix_validation(prefix: string): Promise<boolean> {
    const allow_characters: string = process.env.ALLOWED_PREFIX_CHARACTERS;
    const prefix_length: number = prefix.length;
    if (prefix_length < 1 || prefix_length > 5) {
        return (false);
    }
    for (let c of prefix) {
        if (!(allow_characters.includes(c))) {
            return (false);
        }
    }
    return (true);
}

export { prefix_validation }