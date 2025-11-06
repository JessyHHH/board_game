import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBalanceEntity } from '../../users/entities/user-balance.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameRoomService {
    constructor(@InjectRepository(UserBalanceEntity) private readonly userBalanceRepository: Repository<UserBalanceEntity>) {}
    public async checkBalanceForGame(
        userId: number,
        requiredAmount: number = 100,
    ): Promise<{ canPlay: boolean; currentBalance: number; message: string }> {
        const userBalance = await this.userBalanceRepository.findOne({
            where: {
                userId,
            },
        });
        if (!userBalance) {
            return {
                canPlay: false,
                currentBalance: 0,
                message: '用户余额不存在',
            };
        }

        const canPlay = userBalance.balance >= requiredAmount;
        return {
            canPlay: canPlay,
            currentBalance: userBalance.balance,
            message: canPlay ? '余额充足' : '余额不足',
        };
    }
}
