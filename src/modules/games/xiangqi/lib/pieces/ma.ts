import { PIECE_TYPE, PLAYER_ID } from '../xiangqi-id';
import { BasePiece } from './base-piece';
import { Board } from '../board.entity';

export class Ma extends BasePiece {
    constructor(player: PLAYER_ID) {
        super(PIECE_TYPE.MA, player);
    }

    protected isValidMove(board: Board, player: PLAYER_ID, fromX: number, fromY: number, toX: number, toY: number): boolean {
        const dx = toX - fromX;
        const dy = toY - fromY;

        //必须走日字
        if (!((Math.abs(dx) === 1 && Math.abs(dy) === 2) || (Math.abs(dx) === 2 && Math.abs(dy) === 1))) {
            return false;
        }
        //检查路径是否遮挡（遮挡马腿）
        let legX: number, legY: number;
        if (Math.abs(dx) === 2) {
            legX = fromX + dx / 2;
            legY = fromY;
        } else {
            legX = fromX;
            legY = fromY + dy / 2;
        }
        if (!board.isEmpty(legX, legY)) {
            return false;
        }
        return true;
    }
}

export const MA_MOVE = new Ma(PLAYER_ID.RED | PLAYER_ID.BLACK); // 红黑都可以走的规则
