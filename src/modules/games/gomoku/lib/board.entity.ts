export class Board {
    private board: (number | null)[][];

    constructor() {
        this.board = Array.from({ length: 15 }, () => Array(15).fill(null));
    }

    //在棋盘上放置棋子
    public placeStone(x: number, y: number, player: number): boolean {
        if (!this.isValidMove(x, y)) {
            return false;
        }
        if (this.board[x][y] !== null) {
            return false;
        }
        this.board[x][y] = player;
        return true;
    }

    //判断是否是有效移动
    public isValidMove(x: number, y: number): boolean {
        return x >= 0 && x < 15 && y >= 0 && y < 15;
    }

    //检查是否胜利（指定位置四个方向连成五子）
    public checkWin(x: number, y: number, player: number): boolean {
        const directions = [
            [0, 1],
            [1, 0],
            [1, 1],
            [1, -1],
        ];

        for (const [dx, dy] of directions) {
            const count = this.countLine(x, y, dx, dy, player);
            if (count >= 5) {
                console.log(`Player ${player} wins in direction ${dx}, ${dy}`);
                return true;
            }
        }
        return false;
    }

    //计算指定方向的连续棋子数，包括正方向和反方向
    private countLine(x: number, y: number, dx: number, dy: number, player: number): number {
        let count = 1; //当前位置

        //正方向
        count += this.countDirection(x, y, dx, dy, player);

        //反方向
        count += this.countDirection(x, y, -dx, -dy, player);

        return count;
    }

    //计算指定方向的连续棋子数
    private countDirection(x: number, y: number, dx: number, dy: number, player: number): number {
        let count = 0;
        let nx = x + dx;
        let ny = y + dy;
        //边界条件
        while (this.isValidMove(nx, ny) && this.board[nx][ny] === player) {
            count++;
            nx += dx;
            ny += dy;
        }
        return count;
    }
    //判断棋盘是否满
    public isFull(): boolean {
        return this.board.every((row) => row.every((cell) => cell !== null));
    }

    //获取棋盘状态
    public getState(): (number | null)[][] {
        return this.board.map((row) => row.slice());
    }

    public isEmptyState(x: number, y: number): boolean {
        return this.board[x][y] === null;
    }
}
