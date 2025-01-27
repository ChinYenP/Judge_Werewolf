interface DisplayTextType {
    [key: string]: string | DisplayText;  // Recursively allow strings or nested DisplayText objects
}

interface ConfigType {
    [key: string]: string | number | DisplayText;  // Recursively allow strings or nested DisplayText objects
}