const display_text: DisplayTextType = {
    "general": {
        "error": {
            "display": {
                "eng": "Something has gone wrong during the code runtime: Error ",
                "malay": "Sesuatu telah berlaku semasa masa jalan kod: Ralat ",
                "schi": "代码运行时出了点问题: 错误",
                "tchi": "代碼運行時出了點問題: 錯誤",
                "yue": "代碼運行時出咗啲問題: 錯誤"
            }
        },
        "command_not_exist": {
            "eng": "This command does not exist: ",
            "malay": "Perintah ini tidak wujud: ",
            "schi": "该命令不存在: ",
            "tchi": "該命令不存在: ",
            "yue": "呢個命令唔存在: "
        },
        "command_args_error": {
            "less_args": {
                "eng": " requires more arguments.",
                "malay": " memerlukan lebih banyak argumen.",
                "schi": "需要更多的参数。",
                "tchi": "需要更多的參數。",
                "yue": "要仲參数。"
            },
            "wrong_args": {
                "eng": " has wrong argument(s): ",
                "malay": " mempunyai argumen yang salah: ",
                "schi": "有错误的参数: ",
                "tchi": "有錯誤的參數: ",
                "yue": "有错误嘅參数: "
            },
            "much_args": {
                "eng": " has too much arguments.",
                "malay": " mempunyai terlalu banyak argumen.",
                "schi": "有太多的参数。",
                "tchi": "有太多的參數。",
                "yue": "有太多嘅參數。"
            }
        },
        "permission_error": {
            "not_administrator": {
                "eng": "You have no Administrator permission.",
                "malay": "Anda tiada kebenaran Pentadbir.",
                "schi": "您没有管理员权限。",
                "tchi": "您沒有管理員權限。",
                "yue": "你冇管理員權限。"
            }
        },
        "outdated_interaction": {
            "eng": "Seems that you are trying to interact with outdated interaction (like a message).",
            "malay": "Nampaknya anda cuba berinteraksi dengan interaksi lapuk (seperti mesej).",
            "schi": "似乎您正在尝试与过时的交互(例如讯息)进行互动。",
            "tchi": "似乎您正在嘗試與過時的交互(例如訊息)進行互動。",
            "yue": "似乎你系度嘗試與過時嘅交互(例如訊息)進行互動。"
        },
        "timeout_display": {
            "eng": "This command has a remaining cooldown of: ",
            "malay": "Perintah ini mempunyai baki penyejukan sebanyak: ",
            "schi": "该命令的剩余冷却时间为: ",
            "tchi": "該命令的剩餘冷卻時間為: ",
            "yue": "該命令嘅剩餘冷卻時間為: "
        }
    },
    "ping": {
        "pong": {
            "eng": "Pong!",
            "malay": "Pong!",
            "schi": "乓!",
            "tchi": "乓!",
            "yue": "乓!"
        },
        "latency": {
            "eng": "Latency: ",
            "malay": "Kependaman: ",
            "schi": "延迟: ",
            "tchi": "延遲: ",
            "yue": "延遲: "
        },
        "ws_latency": {
            "eng": "Websocket Latency: ",
            "malay": "Kependaman Soket Web: ",
            "schi": "Websocket延迟: ",
            "tchi": "Websocket延遲: ",
            "yue": "Websocket延遲: "
        }
    },
    "help": {
        "eng": "__List of Judge Werewolf bot's Commands (replace <...>)__\nYou may mention bot instead of using prefix.\n\n**jw help** List down all commands.\n**jw ping** Replies with \"Pong\"!\n**jw settings <optional arguments>** List settings for user and server if contains no/wrong arguments. Apply server settings if contains correct arguments.\n**jw create <optional ID>** Create and start a game. Insert appropriate ID to create a specific board quickly.",
        "malay": "__Senarai Arahan Judge Werewolf bot (ganti <...>)__\nAnda boleh menggunakan set awalan atau bot sebutan.\n\n**jw help** Senarai semua arahan.\n**jw ping** Balas dengan \"Pong\"!\n**jw settings <argumen pilihan>** Senaraikan tetapan untuk pengguna dan pelayan jika tidak mengandungi argumen / mengandungi argumen yang salah. Gunakan tetapan pelayan jika mengandungi argumen yang betul.\n**jw create <optional ID>** Buat dan mulakan permainan. Masukkan ID yang sesuai untuk membuat papan tertentu dengan cepat.",
        "schi": "__列出 Judge Werewolf 机器人的指令 (替换 <...>)__\n您可以使用前缀集或提及机器人。\n\n**jw help** 列出所有指令。\n**jw ping** 回复\"乓\"!\n**jw settings <可选参数>** 如果不包含/错误参数, 则列出用户和服务器的设置。如果包含正确的参数, 则应用服务器设置。\n**jw create <optional ID>** 创建并开始游戏。插入适当的ID即可快速创建特定的板。",
        "tchi": "__列出 Judge Werewolf 機器人的指令 (替換 <...>)__\n您可以使用前綴集或提及機器人。\n\n**jw help** 列出所有指令。\n**jw ping** 回覆\"乓\"!\n**jw settings <可選參數>** 如果不包含/錯誤參數, 則列出用戶和服務器的設置。如果包含正確的參數, 則應用服務器設置。\n**jw create <optional ID>** 創建並開始遊戲。插入適當的ID即可快速建立特定的板。",
        "yue": "__列出 Judge Werewolf 機械人嘅指令 (替換 <...>)__\n你可以使用前缀集或提及機器人。\n\n**jw help** 列出所有指令。\n**jw ping** 回覆\"乓\"!\n**jw settings <可選參數>** 如果唔包含/錯誤參數, 就列出用戶同服務器嘅設置。如果包含正確嘅參數, 就應用服務器設置。\n**jw create <optional ID>** 創建並開始遊戲。插入適當嘅ID即可趕建立特定嘅板。"
    },
    "prefix": {
        "current_prefix": {
            "eng": "This server's current prefix: ",
            "malay": "Awalan semasa pelayan ini: ",
            "schi": "该伺服器当前的前缀: ",
            "tchi": "該伺服器当前的前綴: ",
            "yue": "該服務器當前嘅前綴: "
        },
        "instruction": {
            "eng": "This bot's default prefix is: jw\nHowever, use your server's current prefix instead.\nYou may mention the bot instead of using prefix.",
            "malay": "Bahasa: Bahasa Melayu",
            "schi": "此机器人的默认前缀是: jw\n但是, 请使用您服务器的当前前缀。\n您可以提及该机器人而不是使用前缀。",
            "tchi": "此機器人的預設前綴是: jw\n但是, 請使用您伺服器的當前前綴。\n您可以提及該機器人而不是使用前綴。",
            "yue": "此機械人嘅默認前綴係: jw\n但是, 請使用你服務器嘅當前前綴。\n你可以提及該機械人而唔係使用前綴。"
        }
    },
    "settings": {
        "user_settings": {
            "eng": "__User Settings__\n**Language:** Set the language used for this bot. (Default: English)",
            "malay": "__Tetapan Pengguna__\n**Bahasa:** Tetapkan bahasa yang digunakan untuk bot ini. (Lalai: English)",
            "schi": "__用户设置__\n**语言:** 设置此机器人使用的语言。(预设: English)",
            "tchi": "__用戶設置__\n**語言:** 設置此機器人使用的語言。(預設: English)",
            "yue": "__用戶設置__\n**語言:** 設置此機械人使用嘅語言。(預設: English)",
            "placeholder_text": {
                "lang": {
                    "eng": "Language: English",
                    "malay": "Bahasa: Bahasa Melayu",
                    "schi": "语言: 简体中文",
                    "tchi": "語言: 繁體中文",
                    "yue": "語言: 粵語",
                    "default": "Language: None (default: English)"
                }
            }
        },
        "server_settings": {
            "eng": "__Server Settings (Administrator users can change these settings)__\n**Prefix:**\nSet the prefix for all commands for this bot. (Default: jw)\nCommand (replace <...>): <old prefix or mention bot> settings prefix <new prefix>\nPrefix must have between 1 to 5 characters inclusive, and only contains the following characters:\n",
            "malay": "__Tetapan Pelayan (Pengguna pentadbir boleh menukar tetapan ini)__\n**Awalan:**\nTetapkan awalan untuk semua arahan untuk bot ini. (Lalai: jw)\nArahan (ganti <...>): <awalan lama atau sebutan bot> settings prefix <awalan baharu>\nAwalan mesti mempunyai antara 1 hingga 5 aksara termasuk, dan hanya mengandungi aksara berikut:\n",
            "schi": "__服务器设置 (管理员用户可以更改这些设置)__\n**前缀:**\n为此机器人设置所有命令的前缀。(预设: jw)\n指令(替换 <...>): <旧前缀或提及机器人> settings prefix <新前缀>\n前缀必须包含1到5个字符(含), 并且仅包含以下字符:\n",
            "tchi": "__服務器設置 (管理員用戶可以更改這些設置)__\n**前綴:**\n爲此機器人設置所有命令的前綴。(預設: jw)\n指令(替換 <...>): <舊前綴或提及機器人> settings prefix <新前綴>\n前綴必須包含1到5個字符(含), 並且僅包含以下字符:\n",
            "yue": "__服務器設置 (管理員用戶可以更改呢啲設置)__\n**前綴:**\n爲此機械人設置所有命令嘅前綴。(預設: jw)\n指令(替換 <...>): <舊前綴或提及機械人> settings prefix <新前綴>\n前綴一定要包含1到5個字元(含), 兼夾僅包含以下字元:\n",
            "prefix": {
                "invalid_prefix": {
                    "eng": "Your new prefix is invalid.\nNote that prefix must have between 1 to 5 characters inclusive, and only contains the following characters:\n",
                    "malay": "Awalan baharu anda tidak sah.\nPerhatikan bahawa awalan mesti mempunyai antara 1 hingga 5 aksara termasuk, dan hanya mengandungi aksara berikut:\n",
                    "schi": "您的新前缀无效。\n注意前缀必须包含1到5个字符(含), 并且仅包含以下字符:\n",
                    "tchi": "您的新前綴無效。\n注意前綴必須包含1到5個字符(含), 並且僅包含以下字符:\n",
                    "yue": "您的新前綴無效。\n注意前綴一定要包含1到5個字元(含), 兼夾僅包含以下字元:\n"
                },
                "confirmation": {
                    "eng": "Are you sure you want to change this bot's prefix for this server?\nNew prefix: ",
                    "malay": "Adakah anda pasti mahu menukar awalan bot ini untuk pelayan ini?\nAwalan baharu: ",
                    "schi": "您确定要更改该服务器的机器人前缀吗? \n新前缀: ",
                    "tchi": "您確定要更改該服務器的機器人前綴嗎? \n新前綴: ",
                    "yue": "你肯定要更改該服務器嘅機械人前綴嗎? \n新前綴: "
                },
                "button_yes": {
                    "eng": "Yes",
                    "malay": "Ya",
                    "schi": "是",
                    "tchi": "是",
                    "yue": "系"
                },
                "button_no": {
                    "eng": "No",
                    "malay": "Tidak",
                    "schi": "否",
                    "tchi": "否",
                    "yue": "否"
                },
                "timeout_text": {
                    "eng": "Prefix confirmation are disabled after inactivity: ",
                    "malay": "Pengesahan awalan dilumpuhkan selepas tidak aktif: ",
                    "schi": "在不活动后将禁用前缀确认: ",
                    "tchi": "在不活動後將禁用前綴確認: ",
                    "yue": "喺唔活動後將停用前綴確認: "
                },
                "cancelation": {
                    "eng": "Cancelled prefix setting.",
                    "malay": "Tetapan awalan dibatalkan.",
                    "schi": "取消前缀设置。",
                    "tchi": "取消前綴設置。",
                    "yue": "取消前綴設置。"
                },
                "success": {
                    "eng": "Prefix has changed to: ",
                    "malay": "Awalan telah berubah kepada: ",
                    "schi": "前缀已更改为: ",
                    "tchi": "前綴已更改為: ",
                    "yue": "前綴已更改為: "
                }
            }
        },
        "timeout": {
            "eng": "Settings adjustments are disabled after inactivity: ",
            "malay": "Penyesuaian tetapan dilumpuhkan selepas tidak aktif: ",
            "schi": "在不活动后将禁用设置调整: ",
            "tchi": "在不活動後將禁用設置調整: ",
            "yue": "喺唔活動後將停用設置較: "
        }
    },
    "create": {
        "initial": {
            "eng": "__Create a Game Board (Progress 1/3)__\n\n**Number of Players:** The more players there are in a board, the harder the game will be.\nBetween 6 to 12 players inclusive.\n\n**Preset or Custom:**\nPreset - There will be wide selection of preset boards to be played.\nCustom - You may choose any combinations of roles you want.",
            "malay": "__Buat Papan Permainan (Kemajuan 1/3)__\n\n**Bilangan Pemain:** Semakin ramai pemain dalam papan, semakin sukar permainan tersebut.\nTermasuk antara 6 hingga 12 pemain.\n\n* *Pratetap atau Tersuai:**\nPratetap - Terdapat pelbagai pilihan papan pratetap untuk dimainkan.\nTersuai - Anda boleh memilih mana-mana gabungan peranan yang anda mahukan.",
            "schi": "__创建游戏板子(进度 1/3)__\n\n**玩家数量:** 板子中的玩家越多, 游戏就越难。\n6 到 12 名玩家（含）。\n\n**预设或自定义:**\n预设 - 将有多种预设板可供选择。\n自定义 - 您可以选择所需角色的任意组合。",
            "tchi": "__創建遊戲板子(進度 1/3)__\n\n**玩家數量:** 板子中的玩家越多, 遊戲就越難。\n6 到 12 名玩家（含）。\n\n**預設或自定義:**\n預設 - 將有多種預設板可供選擇。\n自定義 - 您可以選擇所需角色的任意組合。",
            "yue": "__創建遊戲板(進度1/3)__\n\n**玩家數量:** 板中嘅玩家多, 遊戲就越難。\n6到12名玩家(含)。\n\n**預設或自定義:**\n預設 - 將有多種預設板可供選擇。\n自定義 - 你可以選擇所使角色嘅任意組合。",
            "select_num_player": {
                "eng": "Number of Players",
                "malay": "Bilangan Pemain",
                "schi": "玩家数量",
                "tchi": "玩家數量",
                "yue": "玩家數量"
            },
            "placeholder_preset_custom": {
                "eng": "Preset or Custom",
                "malay": "Pratetap atau Tersuai",
                "schi": "预设或自定义",
                "tchi": "預設或自定義",
                "yue": "預設或自定義"
            },
            "preset": {
                "eng": "Preset",
                "malay": "Pratetap",
                "schi": "预设",
                "tchi": "預設",
                "yue": "預設"
            },
            "custom": {
                "eng": "Custom",
                "malay": "Tersuai",
                "schi": "自定义",
                "tchi": "自定義",
                "yue": "自定義"
            },
            "button_next": {
                "eng": "Next",
                "malay": "Seterusnya",
                "schi": "下一个",
                "tchi": "下一個",
                "yue": "下一個"
            },
            "button_cancel": {
                "eng": "Cancel",
                "malay": "Batalkan",
                "schi": "取消",
                "tchi": "取消",
                "yue": "取消"
            }
        },
        "timeout": {
            "eng": "Create game are disabled after inactivity: ",
            "malay": "Buat permainan dilumpuhkan selepas tidak aktif: ",
            "schi": "在不活动后将禁用创建游戏: ",
            "tchi": "在不活動後將禁用創建遊戲: ",
            "yue": "喺唔活動後將停用创建游戏: "
        },
        "cancel": {
            "eng": "Cancelled game creation.",
            "malay": "Pembuatan permainan dibatalkan.",
            "schi": "取消游戏创建。",
            "tchi": "取消遊戲創建。",
            "yue": "取消遊戲創建。"
        }
    }
}

export { display_text }