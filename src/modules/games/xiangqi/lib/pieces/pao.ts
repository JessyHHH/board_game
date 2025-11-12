import { Board } from '../board.entity';
import { PIECE_TYPE, PLAYER_ID } from '../xiangqi-id';
import { BasePiece } from './base-piece';

export class Pao extends BasePiece {
    constructor(player: PLAYER_ID) {
        super(PIECE_TYPE.PAO, player);
    }
    protected isValidMove(board: Board, player: PLAYER_ID, fromX: number, fromY: number, toX: number, toY: number): boolean {
        //必须在同一行或者同一列（直线移动）
        if (fromX !== toX && fromY !== toY) {
            return false;
        }

        //检查路径上是否有棋子
        const targetPiece = board.getPiece(toX, toY);
        const piecesBetween = this.countPiecesBetween(board, fromX, fromY, toX, toY);

        //如果目标位置有棋子（吃棋子），中间必须有且仅有一个棋子
        if (targetPiece) {
            return piecesBetween === 1;
        } else {
            return piecesBetween === 0;
        }
    }

    private countPiecesBetween(board: Board, fromX: number, fromY: number, toX: number, toY: number): number {
        let piecesBetween = 0;
        if (fromX === toX) {
            const minY = Math.min(fromY, toY);
            const maxY = Math.max(fromY, toY);
            for (let y = minY + 1; y < maxY; y++) {
                if (!board.isEmpty(fromX, y)) {
                    piecesBetween++;
                }
            }
        } else {
            const minX = Math.min(fromX, toX);
            const maxX = Math.max(fromX, toX);
            for (let x = minX + 1; x < maxX; x++) {
                if (!board.isEmpty(x, fromY)) {
                    piecesBetween++;
                }
            }
        }
        return piecesBetween;
    }
}

export const PAO_MOVE = new Pao(PLAYER_ID.RED | PLAYER_ID.BLACK); // 红黑都可以走的规则
