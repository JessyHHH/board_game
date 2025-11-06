import { join } from 'path';
import { MESSAGE_TYPE } from '../../common/common-type';
import { RedisMessageQueueService } from '../../common/redis-message-queue';
import { ClientManager } from '../../ws/client-connection-manager';
import { GameRoomGomoku } from './game-room-gomoku';
import { GameRoomManager } from '../gameRoom/game-room-manager';
//放置启动bootstrap()，不连接数据库进行测试 模拟App.get
jest.mock('../../../main.ts', () => {
    const mockApp = {
        get: jest.fn(() => ({
            publish: jest.fn().mockResolvedValue(undefined),
        })),
    };

    return {
        App: mockApp,
    };
});

jest.mock('lodash', () => ({
    shuffle: jest.fn((arr) => arr), //返回原数组,避免随机性
}));

// jest.mock('../../ws/client-connection-manager', () => ({
//     ClientManager: {
//         sendMessage: jest.fn(),
//     },
// }));

jest.mock('../../ws/client-connection-manager');

describe('GameRoomGomoku', () => {
    let userIds: number[] = [1, 2];
    let mockMessageQueue: any;
    let gameRoom: GameRoomGomoku;
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('constructor and initialize', () => {
        it('创造含有两名玩家的房间', () => {
            gameRoom = new GameRoomGomoku('room-1', [1, 2], {
                disableTimer: true,
                countDownInterval: 3,
                totalCountDownTime: 9,
            });
            gameRoom.join(userIds[0]);
            gameRoom.join(userIds[1]);

            const players = (gameRoom as any).players;

            console.log(players);

            // 验证从 Player 对象获取的 userId
            expect(players).toHaveLength(2);
            expect(players[0].getUserId()).toBe(1);
            expect(players[1].getUserId()).toBe(2);
        });
    });

    it('抛出错误，如果房间没有两名玩家', () => {
        expect(() => {
            new GameRoomGomoku('room-1', [userIds[0]], {});
            gameRoom.join(userIds[0]);
        }).toThrow('userIds must be 2');

        expect(() => {
            new GameRoomGomoku('room-1', [userIds[0], userIds[1], userIds[0]], {});
            gameRoom.join(userIds[0]);
            gameRoom.join(userIds[1]);
            gameRoom.join(userIds[0]);
        }).toThrow('userIds must be 2');
    });

    it('第一名玩家应该是黑棋且为当前回合', () => {
        gameRoom = new GameRoomGomoku('room-1', [userIds[0], userIds[1]], {});
        gameRoom.join(userIds[0]);
        gameRoom.join(userIds[1]);
        const players = (gameRoom as any).players;
        expect(players[0].getPlayerId()).toBe(0);
        expect(players[0].getCurrentRound()).toBe(true);
    });

    it('应该可以自定义options', () => {
        const customOptions = {
            disableTimer: true,
            countDownInterval: 3,
            totalCountDownTime: 9,
        };
        gameRoom = new GameRoomGomoku('room-1', [userIds[0], userIds[1]], customOptions);
        gameRoom.join(userIds[0]);
        gameRoom.join(userIds[1]);
        expect(gameRoom['options']).toEqual(customOptions);
    });
    describe('join', () => {
        beforeEach(() => {
            gameRoom = new GameRoomGomoku('room-1', [userIds[0], userIds[1]], {});
        });

        it('只有一个玩家进入房间还不会产生player', () => {
            gameRoom.join(userIds[0]);
            const players = (gameRoom as any).players;
            expect(players).toHaveLength(0);
        });
        //startGame之后才会产生player对象
        it('如果所有玩家都准备好了，应该开始游戏', () => {
            const startGameSpy = jest.spyOn(gameRoom, 'startGame');
            gameRoom.join(userIds[0]);
            gameRoom.join(userIds[1]);
            const players = (gameRoom as any).players;

            expect(players[0].isReady()).toBe(true);
            expect(players[1].isReady()).toBe(true);
            expect(startGameSpy).toHaveBeenCalled();
        });
    });

    describe('startGame', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            gameRoom = new GameRoomGomoku('room-1', [userIds[0], userIds[1]], {});
            gameRoom.join(userIds[0]);
            gameRoom.join(userIds[1]);
        });
        afterEach(() => {
            jest.useRealTimers();
        });

        it('应该发送游戏开始消息给所有玩家', () => {
            // gameRoom.startGame();, join完自动广播，不需要再调用一次
            console.log((gameRoom as any).players);
            expect(ClientManager.sendMessage).toHaveBeenCalledTimes(2);
            expect(ClientManager.sendMessage).toHaveBeenCalledWith(userIds[0], {
                type: MESSAGE_TYPE.GAME_START,
                data: {
                    players: gameRoom['players'].map((player) => player.toJson()),
                },
            });
            expect(ClientManager.sendMessage).toHaveBeenCalledWith(userIds[1], {
                type: MESSAGE_TYPE.GAME_START,
                data: {
                    players: gameRoom['players'].map((player) => player.toJson()),
                },
            });
        });
        it('当timer为true时启动倒计时定时器', () => {
            const setIntervalSpy = jest.spyOn(global, 'setInterval');
            console.log(setIntervalSpy);
            gameRoom = new GameRoomGomoku('room-1', [userIds[0], userIds[1]], { disableTimer: false });
            gameRoom.join(userIds[0]);
            gameRoom.join(userIds[1]);
            jest.useFakeTimers();

            expect(setIntervalSpy).toHaveBeenCalled();
        });
        it('当timer为false时不会启动倒计时定时器', () => {
            const setIntervalSpy = jest.spyOn(global, 'setInterval');
            gameRoom = new GameRoomGomoku('room-1', [userIds[0], userIds[1]], { disableTimer: true });
            gameRoom.join(userIds[0]);
            gameRoom.join(userIds[1]);
            jest.useFakeTimers();

            expect(setIntervalSpy).not.toHaveBeenCalled();
        });
    });
    //测试messageQueueService的publish方法
    describe('messageQueueService', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            gameRoom = new GameRoomGomoku('room-1', [userIds[0], userIds[1]], {});

            mockMessageQueue = gameRoom['messageQueueService'];

            gameRoom.join(userIds[0]);
            gameRoom.join(userIds[1]);
        });
        it.only('当游戏结束时，应该发布游戏结束消息给所有玩家', () => {
            //设置胜者为userIds[0]
            const winner = gameRoom['players'][0];
            gameRoom['gameOver'](winner);
            console.log(JSON.stringify(mockMessageQueue.publish.mock.calls));
            expect(mockMessageQueue.publish).toHaveBeenCalledWith('game:result', {
                status: '0',
                data: {
                    roomId: gameRoom['roomId'],
                    winner: winner.getPlayerId(),
                },
            });
        });
    });
});
