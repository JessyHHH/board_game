import { RedisModuleAsyncOptions, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';

export default class RedisConfig {
    public static getConfig(configService: ConfigService): RedisModuleOptions {
        return {
            config: [
                {
                    host: configService.get('REDIS_HOST'),
                    port: configService.get<number>('REDIS_PORT'),
                    keyPrefix: 'nestjs-demo:',
                },
            ],
        };
    }
}

export const redisConfigAsync: RedisModuleAsyncOptions = {
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService): Promise<RedisModuleOptions> => RedisConfig.getConfig(configService),
    inject: [ConfigService],
};
