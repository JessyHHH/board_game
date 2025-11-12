import { CheckWin } from './lib/checkWin';
import { Board } from './lib/board.entity';
import { PIECE_TYPE, PLAYER_ID } from './lib/xiangqi-id';
import { Player } from './player';

describe('XiangqiGame', () => {
    let checkWin: CheckWin;
    let board: Board;
    let player1: Player;
    let player2: Player;
    beforeEach(() => {
        checkWin = new CheckWin();
        board = new Board();
        player1 = new Player(PLAYER_ID.RED, 1, true, 9, 9);
        player2 = new Player(PLAYER_ID.BLACK, 2, false, 9, 9);
    });

    describe('CheckBoardState', () => {
        beforeEach(() => {
            board.resetBoard();
        });
        it('红色方和黑色方的棋子初始化应该存在', () => {
            const boardState = board.getBoard();
            console.log(boardState);
            expect(boardState).toEqual(
                expect.arrayContaining([
                    expect.arrayContaining([expect.objectContaining({ type: PIECE_TYPE.BING, player: PLAYER_ID.RED })]),
                    expect.arrayContaining([expect.objectContaining({ type: PIECE_TYPE.BING, player: PLAYER_ID.BLACK })]),
                    expect.arrayContaining([expect.objectContaining({ type: PIECE_TYPE.PAO, player: PLAYER_ID.RED })]),
                    expect.arrayContaining([expect.objectContaining({ type: PIECE_TYPE.PAO, player: PLAYER_ID.BLACK })]),
                    expect.arrayContaining([expect.objectContaining({ type: PIECE_TYPE.JIANG, player: PLAYER_ID.RED })]),
                    expect.arrayContaining([expect.objectContaining({ type: PIECE_TYPE.JIANG, player: PLAYER_ID.BLACK })]),
                    expect.arrayContaining([expect.objectContaining({ type: PIECE_TYPE.JU, player: PLAYER_ID.RED })]),
                    expect.arrayContaining([expect.objectContaining({ type: PIECE_TYPE.JU, player: PLAYER_ID.BLACK })]),
                    expect.arrayContaining([expect.objectContaining({ type: PIECE_TYPE.MA, player: PLAYER_ID.RED })]),
                    expect.arrayContaining([expect.objectContaining({ type: PIECE_TYPE.MA, player: PLAYER_ID.BLACK })]),
                    expect.arrayContaining([expect.objectContaining({ type: PIECE_TYPE.XIANG, player: PLAYER_ID.RED })]),
                    expect.arrayContaining([expect.objectContaining({ type: PIECE_TYPE.XIANG, player: PLAYER_ID.BLACK })]),
                    expect.arrayContaining([expect.objectContaining({ type: PIECE_TYPE.SHI, player: PLAYER_ID.RED })]),
                    expect.arrayContaining([expect.objectContaining({ type: PIECE_TYPE.SHI, player: PLAYER_ID.BLACK })]),
                    expect.arrayContaining([expect.objectContaining({ type: PIECE_TYPE.PAO, player: PLAYER_ID.RED })]),
                    expect.arrayContaining([expect.objectContaining({ type: PIECE_TYPE.PAO, player: PLAYER_ID.BLACK })]),
                ]),
            );
        });
        it('棋盘初始化应该正确摆放棋子', () => {
            //左下角是0,0,右上角是8,9
            const redJiang = board.getPiece(4, 0);
            expect(redJiang).toEqual({ type: PIECE_TYPE.JIANG, player: PLAYER_ID.RED });
            const blackJiang = board.getPiece(4, 9);
            expect(blackJiang).toEqual({ type: PIECE_TYPE.JIANG, player: PLAYER_ID.BLACK });
            const redJu = board.getPiece(0, 0);
            expect(redJu).toEqual({ type: PIECE_TYPE.JU, player: PLAYER_ID.RED });
            const blackJu = board.getPiece(0, 9);
            expect(blackJu).toEqual({ type: PIECE_TYPE.JU, player: PLAYER_ID.BLACK });
            const otherRedJu = board.getPiece(8, 0);
            expect(otherRedJu).toEqual({ type: PIECE_TYPE.JU, player: PLAYER_ID.RED });
            const otherBlackJu = board.getPiece(8, 9);
            expect(otherBlackJu).toEqual({ type: PIECE_TYPE.JU, player: PLAYER_ID.BLACK });
            const redMa = board.getPiece(1, 0);
            expect(redMa).toEqual({ type: PIECE_TYPE.MA, player: PLAYER_ID.RED });
            const blackMa = board.getPiece(1, 9);
            expect(blackMa).toEqual({ type: PIECE_TYPE.MA, player: PLAYER_ID.BLACK });
            const redXiang = board.getPiece(2, 0);
            expect(redXiang).toEqual({ type: PIECE_TYPE.XIANG, player: PLAYER_ID.RED });
            const blackXiang = board.getPiece(2, 9);
            expect(blackXiang).toEqual({ type: PIECE_TYPE.XIANG, player: PLAYER_ID.BLACK });
            const redShi = board.getPiece(3, 0);
            expect(redShi).toEqual({ type: PIECE_TYPE.SHI, player: PLAYER_ID.RED });
            const blackShi = board.getPiece(3, 9);
            expect(blackShi).toEqual({ type: PIECE_TYPE.SHI, player: PLAYER_ID.BLACK });
            const redPao = board.getPiece(1, 2);
            expect(redPao).toEqual({ type: PIECE_TYPE.PAO, player: PLAYER_ID.RED });
            const blackPao = board.getPiece(1, 7);
            expect(blackPao).toEqual({ type: PIECE_TYPE.PAO, player: PLAYER_ID.BLACK });

            for (let i = 0; i < 9; i += 2) {
                const redBing = board.getPiece(i, 3);
                expect(redBing).toEqual({ type: PIECE_TYPE.BING, player: PLAYER_ID.RED });
                const blackBing = board.getPiece(i, 6);
                expect(blackBing).toEqual({ type: PIECE_TYPE.BING, player: PLAYER_ID.BLACK });
            }
        });
    });
    describe('MovePiece', () => {
        beforeEach(() => {
            board.resetBoard();
        });
        it('测试将的移动', () => {
            const redJiang = board.getPiece(4, 0);
            expect(redJiang).toEqual({ type: PIECE_TYPE.JIANG, player: PLAYER_ID.RED });
            const blackJiang = board.getPiece(4, 9);
            expect(blackJiang).toEqual({ type: PIECE_TYPE.JIANG, player: PLAYER_ID.BLACK });

            const redJiangMove = board.movePiece(4, 0, 4, 1, PLAYER_ID.RED);
            const blackJiangMove = board.movePiece(4, 9, 4, 8, PLAYER_ID.BLACK);
            expect(redJiangMove).toEqual(true);
            expect(blackJiangMove).toEqual(true);
            expect(board.getPiece(4, 1)).toEqual({ type: PIECE_TYPE.JIANG, player: PLAYER_ID.RED });
            expect(board.getPiece(4, 0)).toEqual(null);
            expect(board.getPiece(4, 8)).toEqual({ type: PIECE_TYPE.JIANG, player: PLAYER_ID.BLACK });
            expect(board.getPiece(4, 9)).toEqual(null);
        });
        it('测试将的错误移动', () => {
            //测试错误移动，比如移动两格
            const redJiangMove2 = board.movePiece(4, 0, 4, 2, PLAYER_ID.RED);
            console.log(redJiangMove2);
            expect(redJiangMove2).toEqual(false);
            expect(board.getPiece(4, 0)).toEqual({ type: PIECE_TYPE.JIANG, player: PLAYER_ID.RED });
            expect(board.getPiece(4, 2)).toEqual(null);
            const blackJiangMove2 = board.movePiece(4, 9, 4, 7, PLAYER_ID.BLACK);
            console.log(blackJiangMove2);
            expect(blackJiangMove2).toEqual(false);
            expect(board.getPiece(4, 9)).toEqual({ type: PIECE_TYPE.JIANG, player: PLAYER_ID.BLACK });
            expect(board.getPiece(4, 7)).toEqual(null);

            //测试离开九宫格,连续移动4次
            board.movePiece(4, 0, 4, 1, PLAYER_ID.RED);
            board.movePiece(4, 1, 4, 2, PLAYER_ID.RED);
            const redJiangLeave = board.movePiece(4, 2, 4, 3, PLAYER_ID.RED);

            expect(redJiangLeave).toEqual(false);
            expect(board.getPiece(4, 2)).toEqual({ type: PIECE_TYPE.JIANG, player: PLAYER_ID.RED });
            expect(board.getPiece(4, 3)).toEqual({ type: PIECE_TYPE.BING, player: PLAYER_ID.RED });
        });
        it('测试将错误吃子,比如自己吃自己的子', () => {
            const redJiang = board.getPiece(4, 0);
            expect(redJiang).toEqual({ type: PIECE_TYPE.JIANG, player: PLAYER_ID.RED });
            const blackJu = board.getPiece(0, 9);
            expect(blackJu).toEqual({ type: PIECE_TYPE.JU, player: PLAYER_ID.BLACK });

            const redJiangEat = board.movePiece(4, 0, 3, 0, PLAYER_ID.RED);
            expect(redJiangEat).toEqual(false);
            expect(board.getPiece(4, 0)).toEqual({ type: PIECE_TYPE.JIANG, player: PLAYER_ID.RED });
            expect(board.getPiece(3, 0)).toEqual({ type: PIECE_TYPE.SHI, player: PLAYER_ID.RED });
        });
        it('测试将正确吃子,比如吃对方的棋子', () => {
            board.setPieceForceMove(2, 7, 4, 1);
            board.movePiece(4, 0, 4, 1, PLAYER_ID.RED);
            expect(board.getPiece(4, 1)).toEqual({ type: PIECE_TYPE.JIANG, player: PLAYER_ID.RED });
            expect(board.getPiece(4, 0)).toEqual(null);
            expect(board.getPiece(2, 7)).toEqual(null);
        });

        it('测试马的正确移动', () => {
            const redMa = board.getPiece(1, 0);
            expect(redMa).toEqual({ type: PIECE_TYPE.MA, player: PLAYER_ID.RED });

            const redMaMove = board.movePiece(1, 0, 0, 2, PLAYER_ID.RED);
            expect(redMaMove).toEqual(true);
        });

        it('测试马的错误移动', () => {
            const redMa = board.getPiece(1, 0);
            expect(redMa).toEqual({ type: PIECE_TYPE.MA, player: PLAYER_ID.RED });

            const redMaMove = board.movePiece(1, 0, 1, 2, PLAYER_ID.RED);
            expect(redMaMove).toEqual(false);
        });

        it('测试马的正确吃子', () => {
            const redMa = board.getPiece(1, 0);
            expect(redMa).toEqual({ type: PIECE_TYPE.MA, player: PLAYER_ID.RED });

            board.setPieceForceMove(2, 7, 0, 2);
            const redMaEat = board.movePiece(1, 0, 0, 2, PLAYER_ID.RED);
            expect(redMaEat).toEqual(true);
            expect(board.getPiece(1, 0)).toEqual(null);
            expect(board.getPiece(0, 2)).toEqual({ type: PIECE_TYPE.MA, player: PLAYER_ID.RED });
        });

        it('测试相的正确移动', () => {
            const redXiang = board.getPiece(2, 0);
            expect(redXiang).toEqual({ type: PIECE_TYPE.XIANG, player: PLAYER_ID.RED });

            const redXiangMove = board.movePiece(2, 0, 4, 2, PLAYER_ID.RED);
            expect(redXiangMove).toEqual(true);
            expect(board.getPiece(2, 0)).toEqual(null);
            expect(board.getPiece(4, 2)).toEqual({ type: PIECE_TYPE.XIANG, player: PLAYER_ID.RED });
        });

        it('测试相的错误移动', () => {
            const redXiang = board.getPiece(2, 0);
            expect(redXiang).toEqual({ type: PIECE_TYPE.XIANG, player: PLAYER_ID.RED });

            const redXiangMove = board.movePiece(2, 0, 2, 2, PLAYER_ID.RED);
            expect(redXiangMove).toEqual(false);
            expect(board.getPiece(2, 0)).toEqual({ type: PIECE_TYPE.XIANG, player: PLAYER_ID.RED });
            expect(board.getPiece(2, 2)).toEqual(null);
        });

        it('测试相的正确吃子', () => {
            const redXiang = board.getPiece(2, 0);
            expect(redXiang).toEqual({ type: PIECE_TYPE.XIANG, player: PLAYER_ID.RED });

            board.setPieceForceMove(2, 7, 4, 2);
            const redXiangEat = board.movePiece(2, 0, 4, 2, PLAYER_ID.RED);
            expect(redXiangEat).toEqual(true);
            expect(board.getPiece(2, 0)).toEqual(null);
            expect(board.getPiece(4, 2)).toEqual({ type: PIECE_TYPE.XIANG, player: PLAYER_ID.RED });
        });

        it('测试士的正确移动', () => {
            const redShi = board.getPiece(3, 0);
            expect(redShi).toEqual({ type: PIECE_TYPE.SHI, player: PLAYER_ID.RED });

            const redShiMove = board.movePiece(3, 0, 4, 1, PLAYER_ID.RED);
            expect(redShiMove).toEqual(true);
            expect(board.getPiece(3, 0)).toEqual(null);
            expect(board.getPiece(4, 1)).toEqual({ type: PIECE_TYPE.SHI, player: PLAYER_ID.RED });
        });

        it('测试士的错误移动', () => {
            const redShi = board.getPiece(3, 0);
            expect(redShi).toEqual({ type: PIECE_TYPE.SHI, player: PLAYER_ID.RED });

            const redShiMove = board.movePiece(3, 0, 3, 1, PLAYER_ID.RED);
            expect(redShiMove).toEqual(false);
        });

        it('测试士不能出九宫格', () => {
            const redShi = board.getPiece(3, 0);
            expect(redShi).toEqual({ type: PIECE_TYPE.SHI, player: PLAYER_ID.RED });

            const redShiMove = board.movePiece(3, 0, 2, 1, PLAYER_ID.RED);
            expect(redShiMove).toEqual(false);
            expect(board.getPiece(3, 0)).toEqual({ type: PIECE_TYPE.SHI, player: PLAYER_ID.RED });
            expect(board.getPiece(4, 1)).toEqual(null);
        });

        it('测试士只能斜着走', () => {
            const redShi = board.getPiece(3, 0);
            expect(redShi).toEqual({ type: PIECE_TYPE.SHI, player: PLAYER_ID.RED });

            board.setPieceForceMove(3, 0, 4, 1);
            const redShiMove = board.movePiece(4, 1, 3, 1, PLAYER_ID.RED);
            expect(redShiMove).toEqual(false);
            expect(board.getPiece(4, 1)).toEqual({ type: PIECE_TYPE.SHI, player: PLAYER_ID.RED });
            expect(board.getPiece(3, 1)).toEqual(null);
        });

        it('测试士的正确吃子', () => {
            const redShi = board.getPiece(3, 0);
            expect(redShi).toEqual({ type: PIECE_TYPE.SHI, player: PLAYER_ID.RED });

            board.setPieceForceMove(2, 7, 4, 1);
            const redShiEat = board.movePiece(3, 0, 4, 1, PLAYER_ID.RED);
            expect(redShiEat).toEqual(true);
            expect(board.getPiece(3, 0)).toEqual(null);
            expect(board.getPiece(4, 1)).toEqual({ type: PIECE_TYPE.SHI, player: PLAYER_ID.RED });
        });

        it('测试炮的正确移动', () => {
            const redPao = board.getPiece(1, 2);
            expect(redPao).toEqual({ type: PIECE_TYPE.PAO, player: PLAYER_ID.RED });

            const redPaoMove = board.movePiece(1, 2, 4, 2, PLAYER_ID.RED);
            expect(redPaoMove).toEqual(true);
            expect(board.getPiece(1, 2)).toEqual(null);
            expect(board.getPiece(4, 2)).toEqual({ type: PIECE_TYPE.PAO, player: PLAYER_ID.RED });
        });

        it('测试炮的错误移动', () => {
            const redPao = board.getPiece(1, 2);
            expect(redPao).toEqual({ type: PIECE_TYPE.PAO, player: PLAYER_ID.RED });

            board.setPieceForceMove(1, 2, 1, 3);
            const redPaoMove = board.movePiece(1, 3, 3, 3, PLAYER_ID.RED);
            expect(redPaoMove).toEqual(false);
            expect(board.getPiece(1, 3)).toEqual({ type: PIECE_TYPE.PAO, player: PLAYER_ID.RED });
            expect(board.getPiece(3, 3)).toEqual(null);
        });

        it('测试炮的正确吃子', () => {
            const redPao = board.getPiece(1, 2);
            expect(redPao).toEqual({ type: PIECE_TYPE.PAO, player: PLAYER_ID.RED });

            board.setPieceForceMove(1, 2, 4, 2);
            const redPaoEat = board.movePiece(4, 2, 4, 6, PLAYER_ID.RED);
            expect(redPaoEat).toEqual(true);
            expect(board.getPiece(4, 2)).toEqual(null);
            expect(board.getPiece(1, 2)).toEqual(null);
            expect(board.getPiece(4, 6)).toEqual({ type: PIECE_TYPE.PAO, player: PLAYER_ID.RED });
        });

        it('测试炮的错误吃子', () => {
            const redPao = board.getPiece(1, 2);
            expect(redPao).toEqual({ type: PIECE_TYPE.PAO, player: PLAYER_ID.RED });

            const redPaoEat = board.movePiece(1, 2, 1, 7, PLAYER_ID.RED);
            expect(redPaoEat).toEqual(false);
            expect(board.getPiece(1, 2)).toEqual({ type: PIECE_TYPE.PAO, player: PLAYER_ID.RED });
            expect(board.getPiece(1, 7)).toEqual({ type: PIECE_TYPE.PAO, player: PLAYER_ID.BLACK });
        });

        it('测试兵的正确移动', () => {
            const redBing = board.getPiece(0, 3);
            expect(redBing).toEqual({ type: PIECE_TYPE.BING, player: PLAYER_ID.RED });

            const redBingMove = board.movePiece(0, 3, 0, 4, PLAYER_ID.RED);
            expect(redBingMove).toEqual(true);
            expect(board.getPiece(0, 3)).toEqual(null);
            expect(board.getPiece(0, 4)).toEqual({ type: PIECE_TYPE.BING, player: PLAYER_ID.RED });

            board.setPieceForceMove(0, 4, 0, 5);
            const redBingMove2 = board.movePiece(0, 5, 1, 5, PLAYER_ID.RED);
            expect(redBingMove2).toEqual(true);
            expect(board.getPiece(0, 5)).toEqual(null);
            expect(board.getPiece(1, 5)).toEqual({ type: PIECE_TYPE.BING, player: PLAYER_ID.RED });

            const redBingMove3 = board.movePiece(1, 5, 1, 4, PLAYER_ID.RED);
            expect(redBingMove3).toEqual(false);
            expect(board.getPiece(1, 5)).toEqual({ type: PIECE_TYPE.BING, player: PLAYER_ID.RED });
            expect(board.getPiece(1, 4)).toEqual(null);
        });

        it('测试兵的正确吃子', () => {
            const redBing = board.getPiece(0, 3);
            expect(redBing).toEqual({ type: PIECE_TYPE.BING, player: PLAYER_ID.RED });

            board.setPieceForceMove(0, 3, 0, 5);
            const redBingEat = board.movePiece(0, 5, 0, 6, PLAYER_ID.RED);
            expect(redBingEat).toEqual(true);
            expect(board.getPiece(0, 6)).toEqual({ type: PIECE_TYPE.BING, player: PLAYER_ID.RED });
            expect(board.getPiece(0, 3)).toEqual(null);
            expect(board.getPiece(0, 5)).toEqual(null);
        });
    });

    describe('CheckWin', () => {
        beforeEach(() => {
            board.resetBoard();
        });
        it('测试将帅不能见面', () => {
            board.setPieceForceMove(4, 3, 3, 3);
            board.setPieceForceMove(4, 6, 3, 6);
            expect(checkWin.isInCheck(board, PLAYER_ID.RED)).toEqual(true);
            expect(checkWin.isInCheck(board, PLAYER_ID.BLACK)).toEqual(true);
            expect(checkWin.isCheckmate(board, PLAYER_ID.RED)).toEqual(false);
            expect(checkWin.isCheckmate(board, PLAYER_ID.BLACK)).toEqual(false);
        });
        it('测试', () => {})
    });
});
