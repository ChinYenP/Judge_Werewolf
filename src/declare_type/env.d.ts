declare namespace NodeJS {
    interface ProcessEnv {
        TOKEN: string;
        DBSTORAGE: string;
        DBBACKUPFOLDER: string;
        ALLOWED_PREFIX_CHARACTERS: string;
    };
};