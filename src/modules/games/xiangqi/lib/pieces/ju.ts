import { BasePiece } from './base-piece';
import { PIECE_TYPE, PLAYER_ID } from '../xiangqi-id';
import { Board } from '../board.entity';
export class Ju extends BasePiece {
    constructor(player: PLAYER_ID) {
        super(PIECE_TYPE.JU, player);
    }
    protected isValidMove(board: Board, player: PLAYER_ID, fromX: number, fromY: number, toX: number, toY: number): boolean {
        //必须在同一行或者同一列
        if (fromX !== toX && fromY !== toY) {
            return false;
        }

        //检查路径上是否有棋子
        if (fromX === toX) {
            const minY = Math.min(fromY, toY);
            const maxY = Math.max(fromY, toY);
            for (let y = minY + 1; y < maxY; y++) {
                if (!board.isEmpty(fromX, y)) {
                    return false;
                }
            }
        } else {
            const minX = Math.min(fromX, toX);
            const maxX = Math.max(fromX, toX);
            for (let x = minX + 1; x < maxX; x++) {
                if (!board.isEmpty(x, fromY)) {
                    return false;
                }
            }
        }

        return true;
    }
}

export const JU_MOVE = new Ju(PLAYER_ID.RED | PLAYER_ID.BLACK); // 红黑都可以走的规则
