import { Board } from '../board.entity';
import { PIECE_TYPE, PLAYER_ID } from '../xiangqi-id';
import { BasePiece } from './base-piece';

export class Bing extends BasePiece {
    constructor(player: PLAYER_ID) {
        super(PIECE_TYPE.BING, player);
    }
    protected isValidMove(board: Board, player: PLAYER_ID, fromX: number, fromY: number, toX: number, toY: number): boolean {
        const dx = toX - fromX;
        const dy = toY - fromY;
        if (Math.abs(dx) + Math.abs(dy) !== 1) {
            return false;
        }

        //红方向上走, 黑方向下走， 后端的坐标是从左上角为(0,0)
        const forwardDiir = player === PLAYER_ID.RED ? 1 : -1;

        //过河判断
        const crossedRiver = player === PLAYER_ID.RED ? fromY > 4 : fromY < 5;

        if (!crossedRiver) {
            //未过河，只能向前
            if (dy !== forwardDiir && dx !== 0) {
                return false;
            }
            return true;
        } else {
            //过河，可以向前和左右移动,只能移动一格
            if (dy === forwardDiir && dx === 0) {
                return true; // 向前
            } else if (dy === 0 && Math.abs(dx) === 1) {
                return true; // 向左右
            } else {
                return false;
            }
        }
    }
}

export const BING_MOVE = new Bing(PLAYER_ID.RED | PLAYER_ID.BLACK); // 红黑都可以走的规则
