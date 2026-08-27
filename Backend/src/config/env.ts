import dotenv from 'dotenv';

dotenv.config();


function getEnv(key:string):string{
    const value = process.env[key];
    if(!value){
        throw new Error(`Missing env variables for ${key}`);
    }
    return value;
}

export const env={
    port: Number(getEnv('PORT')),
    isProduction: (process.env.NODE_ENV ?? "development")==="production",
    nodeEnv: process.env.NODE_ENV ?? "development",
    logLevel:getEnv('LOG_LEVEL'),
    databaseUrl:getEnv('DATABASE_URL'),
    jwtSecret: getEnv('JWT_SECRET'),
    jwtExpiresIn: getEnv('JWT_EXPIRES_IN')
}as const;