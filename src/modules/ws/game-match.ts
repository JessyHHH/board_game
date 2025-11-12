import { App } from '../../main';
import { GAME_IDS, MESSAGE_TYPE } from '../common/common-type';
import { MatchingPlayer } from './game-matching-player';
import { GameRoomManager } from '../games/gameRoom/game-room-manager';
import { UserBalanceEntity } from '../users/entities/user-balance.entity';
import { ClientConnection } from './client-connection';
import { ClientManager } from './client-connection-manager';
import { getRepositoryToken } from '@nestjs/typeorm';

export class G_GameMatch {
    private matchingMap: Map<string, MatchingPlayer[]> = new Map([
        [GAME_IDS.GOMOKU, []],
        [GAME_IDS.XIANGQI, []],
    ]);
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
            if (matchingSet.length < 2) {
                continue;
            }

            await this.processMatching(gameId as GAME_IDS, matchingSet);
        }
    }

    private async processMatching(gameId: GAME_IDS, matchingSet: MatchingPlayer[]) {
        const playersToRemove = new Set<number>();

        for (let i = 0; i < matchingSet.length - 1; i++) {
            if (playersToRemove.has(i)) {
                continue;
            }

            const player1 = matchingSet[i];
            for (let j = i + 1; j < matchingSet.length; j++) {
                if (playersToRemove.has(j)) {
                    continue;
                }

                const player2 = matchingSet[j];
                if (!this.canMatch(player1, player2)) {
                    continue;
                }

                this.createMatch(gameId, player1, player2);
                playersToRemove.add(i);
                playersToRemove.add(j);
                break;
            }
        }

        this.removePlayers(matchingSet, playersToRemove);
    }

    private createMatch(gameId: GAME_IDS, player1: MatchingPlayer, player2: MatchingPlayer) {
        const gameRoom = GameRoomManager.createRoom(gameId as GAME_IDS, [player1.userId, player2.userId]);
        const matchData = {
            gameId,
            roomId: gameRoom.getRoomId(),
        };

        this.sendPlayerMatchedMessage(player1, player2, matchData);
        this.sendPlayerMatchedMessage(player2, player1, matchData);

        console.log(
            `[GameMatch] GameId: ${gameId} Matched: Player ${player1.userId}(${player1.tier}) vs Player ${player2.userId}(${player2.tier})`,
        );
    }

    private removePlayers(matchingSet: MatchingPlayer[], playersToRemove: Set<number>) {
        playersToRemove.forEach((index) => {
            matchingSet.splice(index, 1);
        });
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

        const currentPlayer = new MatchingPlayer(clientConnection.getUserId()!, userBalanceEntity!.balance);
        matchingSet.push(currentPlayer);
        console.log(
            `[GameMatch] Player ${currentPlayer.userId}(${currentPlayer.tier}, ${currentPlayer.balance}) joined queue. Queue size: ${matchingSet.length}`,
        );

        this.checkWaitingPlayers();
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

    private canMatch(player1: MatchingPlayer, player2: MatchingPlayer): boolean {
        if (player1.isSameTier(player2)) {
            return true;
        }

        if (player1.isOpenMatch() || player2.isOpenMatch()) {
            return true;
        }

        return false;
    }

    private sendPlayerMatchedMessage(player: MatchingPlayer, opponent: MatchingPlayer, matchData: any) {
        ClientManager.sendMessage(player.userId, {
            type: MESSAGE_TYPE.GAME_MATCHED,
            data: {
                ...matchData,
                yourTier: player.tier,
                opponentTier: opponent.tier,
            },
        });
    }

    public destroy() {
        if (this.matchCheckInterval) {
            clearInterval(this.matchCheckInterval);
            this.matchCheckInterval = null;
            console.log('[GameMatch] Match checker stopped');
        }
    }
}

export const GameMatch = new G_GameMatch();
