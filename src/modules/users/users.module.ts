import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
import { UserTokenService } from './user-token.service';
import { UserTokenEntity } from './entities/user-token.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, UserTokenEntity])],
    providers: [UsersService, UserTokenService],
})
export class UsersModule {}
