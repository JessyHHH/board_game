import { Player } from './player';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

//赢的人给输的人100块
export class Balance {
    public static async win(winner: Player, loser: Player, userRepository: Repository<User>): Promise<void> {
        const winnerId = winner.getUserId();
        const loserId = loser.getUserId();

        //使用事务确保转账
        await userRepository.manager.transaction(async (transactionalEntityManager) => {
            const winnerUser = await transactionalEntityManager.findOne(User, {
                where: {
                    id: winnerId,
                },
            });
            const loserUser = await transactionalEntityManager.findOne(User, {
                where: {
                    id: loserId,
                },
            });

            if (!winnerUser || !loserUser) {
                throw new Error('User not found');
            }

            if (winnerUser.balance < 100) {
                throw new Error('Winner does not have enough balance');
            }

            //赢的人扣除100块，输的人增加100块
            winnerUser.balance -= 100;
            loserUser.balance += 100;

            //保存用户
            await transactionalEntityManager.save(User, winnerUser);
            await transactionalEntityManager.save(User, loserUser);
        });
    }
}
