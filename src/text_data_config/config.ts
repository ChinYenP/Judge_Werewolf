const config: ConfigType = {
    "display_error": "Something has gone wrong during the code runtime: Error DSPY",
    "default_prefix": "jw",
    "embed_hex_color": 0x00aaff,
    "timeout_sec": {
        "settings": {
            "user": 30,
            "server": {
                "prefix": 15
            }
        },
        "create": {
            "initial": 30,
            "roles": 30,
            "final": 30
        }
    },
    "cooldown_sec": {
        "overall": 1,
        "help": 5,
        "ping": 5,
        "settings": 5,
        "create": 5,
        "prefix": 5
    }
}

export { config }