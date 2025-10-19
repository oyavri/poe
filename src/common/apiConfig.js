function getEnvVariable(name) {
    const val = process.env[name];
    if (!val) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return val;
}

export const apiConfig = {
    // Service config
    hostname: getEnvVariable('CALL_MANAGEMENT_HOSTNAME'),
    port: getEnvVariable('CALL_MANAGEMENT_PORT'),
    jwtSecret: getEnvVariable('JWT_SECRET'),
}
