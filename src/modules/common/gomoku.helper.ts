export class GomokuHelper {
    public static createEmptyBoard(): (number | null)[][] {
        //创建一个15x15的空棋盘
        const board = Array.from({ length: 15 }, () => Array(15).fill(null));
        return board;
    }

    public static isValidMove(board: (number | null)[][], x: number, y: number): boolean {
        if (x < 0 || x >= 15 || y < 0 || y >= 15) {
            return false;
        }
        return board[x][y] === null;
    }

    public static checkWin(board: (number | null)[][], x: number, y: number, player: number): boolean {
        //四个方向：横竖左斜右斜
        const directions = [
            [0, 1],
            [1, 0],
            [1, 1],
            [1, -1],
        ];

        for (const [dx, dy] of directions) {
            const count = this.countLine(board, x, y, dx, dy, player);
            if (count >= 5) {
                return true;
            }
        }
        return false;
    }

    private static countLine(board: (number | null)[][], x: number, y: number, dx: number, dy: number, player: number): number {
        let count = 0;
        for (let i = 1; i <= 5; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board[nx][ny] === player) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    public static isBoardFull(board: (number | null)[][]): boolean {
        //检查棋盘是否满了
        return board.every((x) => x.every((cell) => cell !== null));
    }

    public static generateGameId(player1: string, player2: string): string {
        return `game_${player1.slice(0, 6)}_${player2.slice(0, 6)}_${Date.now()}`;
    }
}
