import { Board } from '../board.entity';
import { PIECE_TYPE, PLAYER_ID } from '../xiangqi-id';

import { BasePiece } from './base-piece';

export class Jiang extends BasePiece {
    constructor(player: PLAYER_ID) {
        super(PIECE_TYPE.JIANG, player);
    }
    protected isValidMove(board: Board, player: PLAYER_ID, fromX: number, fromY: number, toX: number, toY: number): boolean {
        const palaceY = player === PLAYER_ID.RED ? this.palaceYRed : this.palaceYBlack;
        //九宫格内移动
        if (!this.palaceX.includes(toX) || !palaceY.includes(toY)) {
            return false;
        }
        const dx = Math.abs(toX - fromX);
        const dy = Math.abs(toY - fromY);

        if (dx === 0 && dy === 1 && palaceY.includes(toY)) {
            return true;
        }
        if (dx === 1 && dy === 0 && this.palaceX.includes(toX)) {
            return true;
        }

        return false;
    }

    public canMoveTo(board: Board, player: PLAYER_ID, fromX: number, fromY: number, toX: number, toY: number): boolean {
        if (!super.canMoveTo(board, player, fromX, fromY, toX, toY)) {
            return false;
        }
        return !this.isFaceToFace(board, player, toX, toY);
    }

    private isFaceToFace(board: Board, player: PLAYER_ID, toX: number, toY: number): boolean {
        const opponentPlayer = player === PLAYER_ID.RED ? PLAYER_ID.BLACK : PLAYER_ID.RED;
        for (let checkY = 0; checkY < 10; checkY++) {
            if (checkY === toY) {
                continue;
            }
            const piece = board.getPiece(toX, checkY);
            if (!piece) {
                continue;
            }
            let hasBlocker = false;
            if (piece.type === PIECE_TYPE.JIANG && piece.player === opponentPlayer) {
                //检查中间是否有棋子阻挡
                const minY = Math.min(toY, checkY);
                const maxY = Math.max(toY, checkY);
                for (let betweenY = minY + 1; betweenY < maxY; betweenY++) {
                    if (!board.isEmpty(toX, betweenY)) {
                        hasBlocker = true;
                        break;
                    }
                }
                if (!hasBlocker) {
                    return true; //会面对面
                }
            }
        }
        return false;
    }
}

export const JIANG_MOVE = new Jiang(PLAYER_ID.RED | PLAYER_ID.BLACK); // 红黑都可以走的规则
