import { Board } from '../board.entity';
import { PIECE_TYPE, PLAYER_ID } from '../xiangqi-id';
import { BasePiece } from './base-piece';

export class Xiang extends BasePiece {
    constructor(player: PLAYER_ID) {
        super(PIECE_TYPE.XIANG, player);
    }
    protected isValidMove(board: Board, player: PLAYER_ID, fromX: number, fromY: number, toX: number, toY: number): boolean {
        //不能过河
        if ((player === PLAYER_ID.RED && toY > 4) || (player === PLAYER_ID.BLACK && toY < 5)) {
            return false;
        }
        //走田字(斜着走)

        const dx = Math.abs(toX - fromX);
        const dy = Math.abs(toY - fromY);
        if (dx !== 2 || dy !== 2) {
            return false;
        }
        //检查路径是否遮挡（遮挡象眼）
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;
        if (!board.isEmpty(midX, midY)) {
            return false;
        }

        return true;
    }
}

export const XIANG_MOVE = new Xiang(PLAYER_ID.RED | PLAYER_ID.BLACK); // 红黑都可以走的规则
