export const configServiceConfig: any = {
    envFilePath: `.env.${process.env.ENVIRONMENT}`,
    cache: true,
    isGlobal: true,
};

export const GAME_RESULT_CHANNEL = process.env.GAME_RESULT_CHANNEL;
