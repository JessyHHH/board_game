import { Board } from '../board.entity';
import { PIECE_TYPE, PLAYER_ID } from '../xiangqi-id';
export abstract class BasePiece {
    protected palaceX = [3, 4, 5];
    protected palaceYRed = [0, 1, 2];
    protected palaceYBlack = [7, 8, 9];

    constructor(
        private readonly type: PIECE_TYPE,
        private readonly player: PLAYER_ID,
    ) {}

    public canMoveTo(board: Board, player: PLAYER_ID, fromX: number, fromY: number, toX: number, toY: number): boolean {
        const targetPiece = board.getPiece(toX, toY);
        //不能吃自己棋子
        if (targetPiece && targetPiece.player === player) {
            return false;
        }
        //检查具体棋子移动规则
        if (!this.isValidMove(board, player, fromX, fromY, toX, toY)) {
            return false;
        }
        return true;
    }

    protected abstract isValidMove(board: Board, player: PLAYER_ID, fromX: number, fromY: number, toX: number, toY: number): boolean;

    public getType(): PIECE_TYPE {
        return this.type;
    }

    public getPlayer(): PLAYER_ID {
        return this.player;
    }
}
