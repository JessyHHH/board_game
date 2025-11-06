import { Repository } from 'typeorm';
import { App } from '../../main';
import { GAME_IDS, MESSAGE_TYPE, MoneyTier } from '../common/common-type';
import { MatchingPlayer } from '../common/game-matching-player';
import { GameRoomManager } from '../games/gameRoom/game-room-manager';
import { GameRoomService } from '../games/gameRoom/game-room.service';
import { UserBalanceEntity } from '../users/entities/user-balance.entity';
import { ClientConnection } from './client-connection';
import { ClientManager } from './client-connection-manager';
import { getRepositoryToken } from '@nestjs/typeorm';

export class G_GameMatch {
    private matchingMap: Map<string, MatchingPlayer[]> = new Map([[GAME_IDS.GOMOKU, []]]);
    private requiredAmount = 100;

    private matchCheckInterval: NodeJS.Timeout | null = null;
    private readonly CHECK_INTERVAL = 1000;

    constructor() {
        this.startMatchChecker();
    }

    private startMatchChecker() {
        if (this.matchCheckInterval) {
            return;
        }

        this.matchCheckInterval = setInterval(() => {
            this.checkWaitingPlayers();
        }, this.CHECK_INTERVAL);
        console.log('Match checker started');
    }

    private async checkWaitingPlayers() {
        for (const [gameId, matchingSet] of this.matchingMap.entries()) {
            // 至少需要2个玩家才能匹配
            if (matchingSet.length < 2) {
                continue;
            }

            // 尝试匹配池中的玩家
            let i = 0;
            while (i < matchingSet.length - 1) {
                let matched = false;

                for (let j = i + 1; j < matchingSet.length; j++) {
                    // 检查两个玩家是否可以匹配
                    if (this.canMatch(matchingSet[i], matchingSet[j])) {
                        const player1 = matchingSet[i];
                        const player2 = matchingSet[j];

                        // 验证余额
                        const player1Balance = await App.get(getRepositoryToken(UserBalanceEntity)).findOne({
                            where: { userId: player1.userId },
                        });
                        const player2Balance = await App.get(getRepositoryToken(UserBalanceEntity)).findOne({
                            where: { userId: player2.userId },
                        });

                        // 余额不足则移除并继续
                        if (!player1Balance || player1Balance.balance < this.requiredAmount) {
                            matchingSet.splice(i, 1);
                            matched = true;
                            break;
                        }
                        if (!player2Balance || player2Balance.balance < this.requiredAmount) {
                            matchingSet.splice(j, 1);
                            continue;
                        }
                        // 匹配成功！创建房间
                        const gameRoom = GameRoomManager.createRoom(gameId as GAME_IDS, [player1.userId, player2.userId]);

                        // 通知双方
                        ClientManager.sendMessage(player1.userId, {
                            type: MESSAGE_TYPE.GAME_MATCHED,
                            data: {
                                gameId,
                                roomId: gameRoom.getRoomId(),
                                yourTier: player1.tier,
                                opponentTier: player2.tier,
                            },
                        });

                        ClientManager.sendMessage(player2.userId, {
                            type: MESSAGE_TYPE.GAME_MATCHED,
                            data: {
                                gameId,
                                roomId: gameRoom.getRoomId(),
                                yourTier: player2.tier,
                                opponentTier: player1.tier,
                            },
                        });
                        console.log(
                            `[GameMatch] Matched: Player ${player1.userId}(${player1.tier}) vs Player ${player2.userId}(${player2.tier})`,
                        );

                        // 从池中移除两个玩家（先移除后面的索引）
                        matchingSet.splice(j, 1);
                        matchingSet.splice(i, 1);
                        matched = true;
                        break;
                    }
                }

                if (!matched) {
                    i++;
                }
            }
        }
    }

    public async addMatch(clientConnection: ClientConnection, gameId: GAME_IDS) {
        const matchingSet = this.matchingMap.get(gameId);
        //如果匹配集合不存在，则返回
        if (!matchingSet) {
            return;
        }

        if (matchingSet.some((player) => player.userId === clientConnection.getUserId())) {
            return;
        }

        const userBalanceEntity = await App.get(getRepositoryToken(UserBalanceEntity)).findOne({
            where: {
                userId: clientConnection.getUserId()!,
            },
        });

        if (!userBalanceEntity || userBalanceEntity.balance < this.requiredAmount) {
            ClientManager.sendMessage(clientConnection.getUserId()!, {
                type: MESSAGE_TYPE.GAME_BALANCE_NOT_ENOUGH,
                data: {
                    message: '余额不足',
                    currentBalance: userBalanceEntity?.balance || 0,
                    requiredAmount: this.requiredAmount,
                },
            });
            return;
        }

        const currentPlayer: MatchingPlayer = {
            userId: clientConnection.getUserId()!,
            balance: userBalanceEntity!.balance,
            tier: this.getMoneyTier(userBalanceEntity!.balance),
            matchStartTime: Date.now(),
        };

        let matched = false;
        while (matchingSet.length > 0) {
            //尝试从匹配池找到合适的选手
            const opponentIndex = this.findOpponent(currentPlayer, matchingSet);
            //没有找到合适的选手
            if (opponentIndex === -1) {
                break;
            }
            //获取选手信息
            const opponentPlayer = matchingSet[opponentIndex];

            //检查选手余额
            const opponentUserBalance = await App.get(getRepositoryToken(UserBalanceEntity)).findOne({
                where: {
                    userId: opponentPlayer.userId,
                },
            });

            //如果对手余额不足，从匹配池中移除并寻找下一个
            if (!opponentUserBalance || opponentUserBalance.balance < this.requiredAmount) {
                matchingSet.splice(opponentIndex, 1);
                continue;
            }

            matchingSet.splice(opponentIndex, 1);
            matched = true;
            //创建游戏房间
            const gameRoom = GameRoomManager.createRoom(gameId, [clientConnection.getUserId(), opponentPlayer.userId]);

            ClientManager.sendMessage(clientConnection.getUserId()!, {
                type: MESSAGE_TYPE.GAME_MATCHED,
                data: {
                    gameId,
                    roomId: gameRoom.getRoomId(),
                },
            });

            ClientManager.sendMessage(opponentPlayer.userId, {
                type: MESSAGE_TYPE.GAME_MATCHED,
                data: {
                    gameId,
                    roomId: gameRoom.getRoomId(),
                },
            });
        }

        if (!matched) {
            matchingSet.push(currentPlayer);
            console.log(
                `[GameMatch] Player ${currentPlayer.userId}(${currentPlayer.tier}, ${currentPlayer.balance}) joined queue. Queue size: ${matchingSet.length}`,
            );
        }
    }

    public removeClient(clientConnection: ClientConnection) {
        this.matchingMap.forEach((matchingSet, gameId) => {
            if (matchingSet.some((player) => player.userId === clientConnection.getUserId())) {
                matchingSet.splice(
                    matchingSet.findIndex((player) => player.userId === clientConnection.getUserId()),
                    1,
                );
            }
        });
    }

    private getMoneyTier(balance: number): MoneyTier {
        if (balance < 1000) {
            return MoneyTier.LOW;
        } else if (balance < 2000) {
            return MoneyTier.MEDIUM;
        } else {
            return MoneyTier.HIGH;
        }
    }

    private canMatch(player1: MatchingPlayer, player2: MatchingPlayer): boolean {
        const currentTime = Date.now();
        const player1WaitingTime = currentTime - player1.matchStartTime;
        const player2WaitingTime = currentTime - player2.matchStartTime;
        //如果任一玩家等待超过5秒，则可以匹配
        if (player1WaitingTime >= 5000 || player2WaitingTime >= 5000) {
            return true;
        }
        //否则只能匹配同一层级
        return player1.tier === player2.tier;
    }

    private findOpponent(currentPlayer: MatchingPlayer, matchingSet: MatchingPlayer[]): number {
        //使用for循环获得索引
        for (let i = 0; i < matchingSet.length; i++) {
            if (this.canMatch(currentPlayer, matchingSet[i])) {
                return i;
            }
        }
        return -1;
    }

    public destroy(){
        if (this.matchCheckInterval) {
            clearInterval(this.matchCheckInterval);
            this.matchCheckInterval = null;
            console.log('[GameMatch] Match checker stopped');
        }
    }
}

export const GameMatch = new G_GameMatch();
