const config: ConfigType = {
    "default_prefix": "jw",
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
        "settings": 10,
        "create": 5,
        "prefix": 5
    },
    "display_error": "Something has gone wrong during the code runtime: Error DSPY"
}

export { config }