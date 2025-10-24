import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default class TypeOrmDefaultConfig {
    public static getConfig(configService: ConfigService): TypeOrmModuleOptions {
        return {
            type: 'mysql',
            host: configService.get('MYSQL_HOST'),
            port: configService.get<number>('MYSQL_PORT'),
            username: configService.get('MYSQL_USERNAME'),
            password: configService.get('MYSQL_PASSWORD'),
            database: configService.get('MYSQL_DATABASE'),
            autoLoadEntities: true,
            synchronize: false,
            logging: process.env.SHOW_MYSQL_LOG === 'true',
        };
    }
}

export const createTypeOrmConfigAsync = {
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => TypeOrmDefaultConfig.getConfig(configService),
    inject: [ConfigService],
};
