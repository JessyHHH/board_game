import { Player } from '../player';
import { BING_MOVE } from './pieces/bing';
import { JIANG_MOVE } from './pieces/jiang';
import { JU_MOVE } from './pieces/ju';
import { MA_MOVE } from './pieces/ma';
import { PAO_MOVE } from './pieces/pao';
import { SHI_MOVE } from './pieces/shi';
import { XIANG_MOVE } from './pieces/xiang';
import { PIECE_TYPE, PLAYER_ID } from './xiangqi-id';
import { CheckWin } from './checkWin';
export class Board {
    private board: ({ type: PIECE_TYPE; player: PLAYER_ID } | null)[][]; //9x8
    private checkWin: CheckWin;
    constructor() {
        this.checkWin = new CheckWin();
        this.board = Array.from({ length: 9 }, () => Array(10).fill(null));
        this.initBoard();
    }

    //坐标从左下角开始为(0,0)，右上角为(8,9)
    private initBoard(): void {
        // 黑方（上方）
        this.board[0][9] = { type: PIECE_TYPE.JU, player: PLAYER_ID.BLACK };
        this.board[1][9] = { type: PIECE_TYPE.MA, player: PLAYER_ID.BLACK };
        this.board[2][9] = { type: PIECE_TYPE.XIANG, player: PLAYER_ID.BLACK };
        this.board[3][9] = { type: PIECE_TYPE.SHI, player: PLAYER_ID.BLACK };
        this.board[4][9] = { type: PIECE_TYPE.JIANG, player: PLAYER_ID.BLACK };
        this.board[5][9] = { type: PIECE_TYPE.SHI, player: PLAYER_ID.BLACK };
        this.board[6][9] = { type: PIECE_TYPE.XIANG, player: PLAYER_ID.BLACK };
        this.board[7][9] = { type: PIECE_TYPE.MA, player: PLAYER_ID.BLACK };
        this.board[8][9] = { type: PIECE_TYPE.JU, player: PLAYER_ID.BLACK };
        this.board[1][7] = { type: PIECE_TYPE.PAO, player: PLAYER_ID.BLACK };
        this.board[7][7] = { type: PIECE_TYPE.PAO, player: PLAYER_ID.BLACK };
        for (let i = 0; i < 9; i += 2) {
            this.board[i][6] = { type: PIECE_TYPE.BING, player: PLAYER_ID.BLACK };
        }

        // 红方（下方）
        this.board[0][0] = { type: PIECE_TYPE.JU, player: PLAYER_ID.RED };
        this.board[1][0] = { type: PIECE_TYPE.MA, player: PLAYER_ID.RED };
        this.board[2][0] = { type: PIECE_TYPE.XIANG, player: PLAYER_ID.RED };
        this.board[3][0] = { type: PIECE_TYPE.SHI, player: PLAYER_ID.RED };
        this.board[4][0] = { type: PIECE_TYPE.JIANG, player: PLAYER_ID.RED };
        this.board[5][0] = { type: PIECE_TYPE.SHI, player: PLAYER_ID.RED };
        this.board[6][0] = { type: PIECE_TYPE.XIANG, player: PLAYER_ID.RED };
        this.board[7][0] = { type: PIECE_TYPE.MA, player: PLAYER_ID.RED };
        this.board[8][0] = { type: PIECE_TYPE.JU, player: PLAYER_ID.RED };
        this.board[1][2] = { type: PIECE_TYPE.PAO, player: PLAYER_ID.RED };
        this.board[7][2] = { type: PIECE_TYPE.PAO, player: PLAYER_ID.RED };
        for (let i = 0; i < 9; i += 2) {
            this.board[i][3] = { type: PIECE_TYPE.BING, player: PLAYER_ID.RED };
        }
    }

    //判断是否是有效移动
    public isValidMove(
        player: number,
        piece: { type: PIECE_TYPE; player: PLAYER_ID } | null,
        fromX: number,
        fromY: number,
        toX: number,
        toY: number,
    ): boolean {
        if (!piece) {
            return false;
        }
        //根据不同类型设定不同规则，返回是否符合规则
        switch (piece.type) {
            case PIECE_TYPE.JIANG:
                return JIANG_MOVE.canMoveTo(this, player, fromX, fromY, toX, toY);
            case PIECE_TYPE.SHI:
                return SHI_MOVE.canMoveTo(this, player, fromX, fromY, toX, toY);
            case PIECE_TYPE.XIANG:
                return XIANG_MOVE.canMoveTo(this, player, fromX, fromY, toX, toY);
            case PIECE_TYPE.MA:
                return MA_MOVE.canMoveTo(this, player, fromX, fromY, toX, toY);
            case PIECE_TYPE.JU:
                return JU_MOVE.canMoveTo(this, player, fromX, fromY, toX, toY);
            case PIECE_TYPE.PAO:
                return PAO_MOVE.canMoveTo(this, player, fromX, fromY, toX, toY);
            case PIECE_TYPE.BING:
                return BING_MOVE.canMoveTo(this, player, fromX, fromY, toX, toY);
            default:
                return false;
        }
    }

    //移动棋子（包括吃棋）
    public movePiece(fromX: number, fromY: number, toX: number, toY: number, player: number): boolean {
        const piece = this.board[fromX][fromY];

        //验证其实位置有棋子且属于当前玩家
        if (!piece || piece.player !== player) {
            return false;
        }

        //验证移动是否合法
        if (!this.isValidMove(player, piece, fromX, fromY, toX, toY)) {
            return false;
        }

        // if (this.checkWin.checkGameOver(this, player)) {
        //     return false;
        // }
        //移动棋子
        this.board[toX][toY] = piece;
        this.board[fromX][fromY] = null;
        return true;
    }

    //获取棋子
    public getPiece(x: number, y: number): { type: PIECE_TYPE; player: PLAYER_ID } | null {
        if (x < 0 || x >= 9 || y < 0 || y >= 10) {
            return null;
        }
        return this.board[x][y];
    }

    public isEmpty(x: number, y: number): boolean {
        return this.getPiece(x, y) === null;
    }
    //调试用的
    public getBoard(): ({ type: PIECE_TYPE; player: PLAYER_ID } | null)[][] {
        return this.board;
    }

    public setPiece(x: number, y: number, piece: { type: PIECE_TYPE; player: PLAYER_ID } | null): void {
        if (x < 0 || x >= 9 || y < 0 || y >= 10) {
            return;
        }
        this.board[x][y] = piece;
    }

    //克隆棋盘模拟移动
    public clone(): Board {
        const newBoard = new Board();
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 10; y++) {
                newBoard.board[x][y] = this.board[x][y] ? { type: this.board[x][y]!.type, player: this.board[x][y]!.player } : null;
            }
        }
        return newBoard;
    }

    public resetBoard(): void {
        this.initBoard();
    }

    //设置一个任意棋子随意移动方法方便调试
    public setPieceForceMove(fromX: number, fromY: number, toX: number, toY: number): boolean {
        const piece = this.getPiece(fromX, fromY);

        if (!piece) {
            return false;
        }

        // 直接移动，不验证规则
        this.board[toX][toY] = piece;
        this.board[fromX][fromY] = null;
        return true;
    }
}
