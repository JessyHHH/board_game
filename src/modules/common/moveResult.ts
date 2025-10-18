import { playerColor } from '../gomoku/entities/player.entity';

export interface MoveResult {
    success: boolean;
    error?: string;
    gameOver?: boolean;
    winner?: playerColor | 'draw';
    currentPlayer?: number;
}
