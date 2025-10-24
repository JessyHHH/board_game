import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configServiceConfig } from './modules/common/config.config';
import { createTypeOrmConfigAsync } from './modules/common/typeorm.config';
import { redisConfigAsync } from './modules/common/redis.config';
import { RedisModule } from '@liaoliaots/nestjs-redis';


@Module({
    imports: [
        UsersModule,
        ConfigModule.forRoot(configServiceConfig),
        TypeOrmModule.forRootAsync(createTypeOrmConfigAsync),
        RedisModule.forRootAsync(redisConfigAsync),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
