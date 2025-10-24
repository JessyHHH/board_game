import { Game } from './game';
import { Player, playerColor } from './player';

describe('Game', () => {
    let game: Game;
    let player1: Player;
    let player2: Player;
    let player3: Player;
    beforeEach(() => {
        player1 = new Player('player1', playerColor.BLACK, 0, 1); //socketId, color, userId, opponentUserId
        player2 = new Player('player2', playerColor.WHITE, 1, 0); //socketId, color, userId, opponentUserId
        player3 = new Player('player3', playerColor.BLACK, 0, 2); //socketId, color, userId, opponentUserId
        game = new Game(player1, player2);
    });

    describe('constructor', () => {
        it('应该正确创建游戏实例', () => {
            expect(game).toBeDefined();
            expect(game.getId()).toBeDefined();
            expect(game.getPlayers()).toEqual([player1, player2]);
        });

        it('应该正确设置游戏状态', () => {
            const boardState = game.getBoardState();
            expect(boardState).toHaveLength(15);
            expect(boardState[0]).toHaveLength(15);
        });
    });
    describe('makeMove', () => {
        it('允许当前玩家下棋', () => {
            const result = game.makeMove(player1.getSocketId(), 7, 7);
            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('不允许非当前玩家下棋', () => {
            const result = game.makeMove(player2.getSocketId(), 7, 7);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Not current player turn');
        });

        it('应该在有效移动后切换玩家', () => {
            game.makeMove(player1.getSocketId(), 7, 7);
            const currentPlayer = game.getCurrentPlayer();
            expect(currentPlayer.getSocketId()).toBe(player2.getSocketId());
        });

        it('不应该允许在同一位置重复下棋', () => {
            game.makeMove(player1.getSocketId(), 7, 7);
            const result = game.makeMove(player2.getSocketId(), 7, 7);
            console.log(result);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid move');
        });

        it('应该在游戏结束后拒绝移动', () => {
            game.finish();
            const result = game.makeMove(player1.getSocketId(), 7, 7);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Game is finished');
        });

        it('横向胜利', () => {
            //玩家一胜利
            game.makeMove(player1.getSocketId(), 7, 7); // 黑
            game.makeMove(player2.getSocketId(), 6, 7); // 白
            game.makeMove(player1.getSocketId(), 7, 8); // 黑
            game.makeMove(player2.getSocketId(), 6, 8); // 白
            game.makeMove(player1.getSocketId(), 7, 9); // 黑
            game.makeMove(player2.getSocketId(), 6, 9); // 白
            game.makeMove(player1.getSocketId(), 7, 10); // 黑
            game.makeMove(player2.getSocketId(), 6, 10); // 白

            const result = game.makeMove(player1.getSocketId(), 7, 11);
            console.log(result);
            expect(result.success).toBe(true);
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe(player1.getColor());
        });

        it('纵向胜利', () => {
            game.makeMove(player1.getSocketId(), 7, 7); // 黑
            game.makeMove(player2.getSocketId(), 7, 6); // 白
            game.makeMove(player1.getSocketId(), 8, 7); // 黑
            game.makeMove(player2.getSocketId(), 8, 6); // 白
            game.makeMove(player1.getSocketId(), 9, 7); // 黑
            game.makeMove(player2.getSocketId(), 9, 6); // 白
            game.makeMove(player1.getSocketId(), 10, 7); // 黑
            game.makeMove(player2.getSocketId(), 10, 6); // 白

            const result = game.makeMove(player1.getSocketId(), 11, 7);
            console.log(result);
            expect(result.success).toBe(true);
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe(player1.getColor());
        });

        it('斜向胜利', () => {
            game.makeMove(player1.getSocketId(), 7, 7); // 黑
            game.makeMove(player2.getSocketId(), 7, 6); // 白
            game.makeMove(player1.getSocketId(), 8, 8); // 黑
            game.makeMove(player2.getSocketId(), 8, 6); // 白
            game.makeMove(player1.getSocketId(), 9, 9); // 黑
            game.makeMove(player2.getSocketId(), 9, 6); // 白
            game.makeMove(player1.getSocketId(), 10, 10); // 黑
            game.makeMove(player2.getSocketId(), 10, 6); // 白

            const result = game.makeMove(player1.getSocketId(), 11, 11);
            console.log(result);
            expect(result.success).toBe(true);
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe(player1.getColor());
        });
    });
    describe('getCurrentPlayer', () => {
        it('应该返回当前玩家', () => {
            const currentPlayer = game.getCurrentPlayer();
            expect(currentPlayer.getSocketId()).toBe(player1.getSocketId());
        });

        it('应该在移动后返回正确的当前玩家', () => {
            game.makeMove(player1.getSocketId(), 7, 7);
            const currentPlayer = game.getCurrentPlayer();
            expect(currentPlayer.getSocketId()).toBe(player2.getSocketId());
            expect(currentPlayer.getUserId()).toBe(player2.getUserId());
        });
    });
    describe('getPlayers', () => {
        it('应该返回玩家列表', () => {
            const players = game.getPlayers();
            expect(players).toEqual([player1, player2]);
        });
    });

    describe('hasPlayer', () => {
        it('应该返回true如果玩家在游戏中', () => {
            const hasPlayer = game.hasPlayer(player1.getSocketId());
            expect(hasPlayer).toBe(true);
        });

        it('应该返回false如果玩家不在游戏中', () => {
            const hasPlayer = game.hasPlayer(player3.getSocketId());
            expect(hasPlayer).toBe(false);
        });
    });

    describe('getOpponent', () => {
        it('应该返回正确的对手玩家', () => {
            const opponent = game.getOpponent(player1.getSocketId());
            expect(opponent?.getSocketId()).toBe(player2.getSocketId());
        });

        it('应该返回第一个玩家作为第一个人玩家的对手', () => {
            const opponent = game.getOpponent(player1.getSocketId());
            expect(opponent?.getSocketId()).toBe(player2.getSocketId());
        });

        it('应该返回null如果玩家不在游戏中', () => {
            const opponent = game.getOpponent(player3.getSocketId());
            console.log(opponent);
            expect(opponent).toBe(null);
        });
    });

    describe('getBoardState', () => {
        it('应该返回初始的棋盘状态', () => {
            const boardState = game.getBoardState();
            expect(boardState).toHaveLength(15);
            expect(boardState[0]).toHaveLength(15);
        });

        it('应该在下棋后返回更新的棋盘状态', () => {
            game.makeMove(player1.getSocketId(), 7, 7);
            const boardState = game.getBoardState();
            expect(boardState[7][7]).toBe(player1.getPieceType());
        });
    });
    describe('getId', () => {
        it('应该返回游戏ID', () => {
            const id = game.getId();
            console.log(id);
            expect(id).toBeDefined();
            expect(id).toBe(game.getId());
        });

        it('不同的玩家组合应该产生不同的游戏ID', () => {
            const player4 = new Player('player4', playerColor.BLACK, 0, 3); //socketId, color, userId, opponentUserId
            const player5 = new Player('player5', playerColor.WHITE, 1, 4); //socketId, color, userId, opponentUserId
            const game2 = new Game(player4, player5);
            console.log(game2.getId());
            console.log(game.getId());
            expect(game2.getId()).not.toBe(game.getId());
        });
    });

    describe('finish', () => {
        it('应该将游戏状态设置为结束', () => {
            game.finish();
            const result = game.makeMove(player1.getSocketId(), 7, 7);
            console.log(result);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Game is finished');
        });
    });
});
