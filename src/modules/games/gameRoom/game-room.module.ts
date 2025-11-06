import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameRoomService } from './game-room.service';
import { UserBalanceEntity } from '../../users/entities/user-balance.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UserBalanceEntity])],
    providers: [GameRoomService],
})
export class GameRoomModule {}
