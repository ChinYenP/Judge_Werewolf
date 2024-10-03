//You should not fail this normally...
async function prefix_validation(prefix) {
    const allow_characters = process.env.ALLOWED_PREFIX_CHARACTERS;
    const prefix_length = prefix.length;
    if (prefix_length < 1 || prefix_length > 5) {
        return (false);
    };
    for (let i = 0; i < prefix_length; i++) {
        if (!(allow_characters.includes(prefix[i]))) {
            return (false);
        };
    };
    return (true);
};

module.exports = { prefix_validation };