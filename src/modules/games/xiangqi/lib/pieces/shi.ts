import { Board } from '../board.entity';
import { PIECE_TYPE, PLAYER_ID } from '../xiangqi-id';
import { BasePiece } from './base-piece';

export class Shi extends BasePiece {
    constructor(player: PLAYER_ID) {
        super(PIECE_TYPE.SHI, player);
    }

    protected isValidMove(board: Board, player: PLAYER_ID, fromX: number, fromY: number, toX: number, toY: number): boolean {
        const palaceY = player === PLAYER_ID.RED ? this.palaceYRed : this.palaceYBlack;
        if (!palaceY.includes(toY) || !this.palaceX.includes(toX)) {
            return false;
        }
        const dx = Math.abs(toX - fromX);
        const dy = Math.abs(toY - fromY);
        if (dx === 1 && dy === 1) {
            return true;
        }
        return false;
    }
}

export const SHI_MOVE = new Shi(PLAYER_ID.RED | PLAYER_ID.BLACK); // 红黑都可以走的规则
