import { Board } from './board.entity';
import { PIECE_TYPE, PLAYER_ID, WinType } from './xiangqi-id';

export class CheckWin {
    public checkGameOver(board: Board, currentPlayer: PLAYER_ID): boolean {
        const opponentPlayer = currentPlayer === PLAYER_ID.RED ? PLAYER_ID.BLACK : PLAYER_ID.RED;

        //检查帅是否还在棋盘上
        const opponentKing = this.isJiangExist(board, opponentPlayer);
        if (!opponentKing) {
            return true;
        }

        //检查是否将军
        if (!this.isCheckmate(board, opponentPlayer)) {
            return false;
        }

        return true;
    }

    private isJiangExist(board: Board, player: PLAYER_ID): boolean {
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 10; y++) {
                const piece = board.getPiece(x, y);
                if (piece?.type === PIECE_TYPE.JIANG && piece.player === player) {
                    return true;
                }
            }
        }
        return false;
    }

    public isInCheck(board: Board, player: PLAYER_ID): boolean {
        if (!this.isJiangExist(board, player)) {
            return false;
        }
        const opponentPlayer = player === PLAYER_ID.RED ? PLAYER_ID.BLACK : PLAYER_ID.RED;

        // 先找到将的位置
        let jiangX = -1;
        let jiangY = -1;
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 10; y++) {
                const piece = board.getPiece(x, y);
                if (piece?.type === PIECE_TYPE.JIANG && piece.player === player) {
                    jiangX = x;
                    jiangY = y;
                    break;
                }
            }
            if (jiangX !== -1) break;
        }

        if (jiangX === -1) {
            return false;
        }

        //遍历对方所有棋子，检查是否能攻击到将
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 10; y++) {
                const piece = board.getPiece(x, y);
                if (!piece || piece.player !== opponentPlayer) {
                    continue;
                }

                if (board.isValidMove(piece.player, piece, x, y, jiangX, jiangY)) {
                    return true;
                }
            }
        }
        return false;
    }

    public isCheckmate(board: Board, player: PLAYER_ID): boolean {
        //必须被将军，且无法逃脱
        if (!this.isInCheck(board, player)) {
            return false;
        }

        return !this.hasAnyEscape(board, player);
    }

    private hasAnyEscape(board: Board, player: PLAYER_ID): boolean {
        for (let fromX = 0; fromX < 9; fromX++) {
            for (let fromY = 0; fromY < 10; fromY++) {
                const piece = board.getPiece(fromX, fromY);
                if (!piece || piece.player !== player) {
                    continue;
                }
                //尝试该棋子的所有可能移动
                for (let toX = 0; toX < 9; toX++) {
                    for (let toY = 0; toY < 10; toY++) {
                        if (fromX === toX && fromY === toY) {
                            continue;
                        }
                        //检查移动是否合法
                        if (!board.isValidMove(piece.player, piece, fromX, fromY, toX, toY)) {
                            continue;
                        }
                        //模拟移动，检查移动后是否仍被将军
                        if (!this.afterMoveInCheck(board, player, fromX, fromY, toX, toY)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    public afterMoveInCheck(board: Board, player: PLAYER_ID, fromX: number, fromY: number, toX: number, toY: number): boolean {
        const targetPiece = board.getPiece(toX, toY);
        const movingPiece = board.getPiece(fromX, fromY);

        const isOnlyBlocker = this.isOnlyBlockerBetweenJiangs(board, fromX, fromY, player);

        //移动棋子
        board.movePiece(fromX, fromY, toX, toY, player);

        //检查是否仍被将军
        let isInCheck = this.isInCheck(board, player);

        if (!isInCheck && isOnlyBlocker) {
            isInCheck = this.jiangFaceToFace(board);
        }

        //恢复棋子
        this.undoMove(board, player, fromX, fromY, toX, toY, movingPiece!, targetPiece);
        return isInCheck;
    }

    private undoMove(
        board: Board,
        player: PLAYER_ID,
        fromX: number,
        fromY: number,
        toX: number,
        toY: number,
        movingPiece: { type: PIECE_TYPE; player: PLAYER_ID },
        targetPiece: { type: PIECE_TYPE; player: PLAYER_ID } | null,
    ): void {
        (board as any).board[fromX][fromY] = movingPiece;
        (board as any).board[toX][toY] = targetPiece;
    }

    public jiangFaceToFace(board: Board): boolean {
        // 找到红方和黑方的将帅
        let redJiangX = -1,
            redJiangY = -1;
        let blackJiangX = -1,
            blackJiangY = -1;

        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 10; y++) {
                const piece = board.getPiece(x, y);
                if (piece?.type === PIECE_TYPE.JIANG) {
                    if (piece.player === PLAYER_ID.RED) {
                        redJiangX = x;
                        redJiangY = y;
                    } else {
                        blackJiangX = x;
                        blackJiangY = y;
                    }
                }
            }
        }
        // 如果两个将帅都存在且在同一列
        if (redJiangX !== -1 && blackJiangX !== -1 && redJiangX === blackJiangX) {
            // 检查中间是否有棋子阻挡
            const minY = Math.min(redJiangY, blackJiangY);
            const maxY = Math.max(redJiangY, blackJiangY);
            for (let y = minY + 1; y < maxY; y++) {
                if (!board.isEmpty(redJiangX, y)) {
                    return false; // 有阻挡物，不是面对面
                }
            }
            return true; // 面对面！
        }
        return false;
    }

    // 检查该位置的棋子是否是将帅之间唯一的遮挡物
    private isOnlyBlockerBetweenJiangs(board: Board, x: number, y: number, player: PLAYER_ID): boolean {
        // 先检查这个位置是否有当前玩家的棋子
        const piece = board.getPiece(x, y);
        if (!piece || piece.player !== player) {
            return false;
        }

        // 找到红方和黑方的将帅
        let redJiangX = -1,
            redJiangY = -1;
        let blackJiangX = -1,
            blackJiangY = -1;

        for (let ix = 0; ix < 9; ix++) {
            for (let iy = 0; iy < 10; iy++) {
                const p = board.getPiece(ix, iy);
                if (p?.type === PIECE_TYPE.JIANG) {
                    if (p.player === PLAYER_ID.RED) {
                        redJiangX = ix;
                        redJiangY = iy;
                    } else {
                        blackJiangX = ix;
                        blackJiangY = iy;
                    }
                }
            }
        }

        // 如果两个将帅都不存在或不在同一列，则不是遮挡物
        if (redJiangX === -1 || blackJiangX === -1 || redJiangX !== blackJiangX) {
            return false;
        }

        // 检查当前棋子是否在两个将帅之间的同一列
        if (x !== redJiangX) {
            return false;
        }

        const minY = Math.min(redJiangY, blackJiangY);
        const maxY = Math.max(redJiangY, blackJiangY);

        if (y <= minY || y >= maxY) {
            return false; // 不在两个将帅之间
        }

        // 统计两个将帅之间有多少个棋子
        let blockerCount = 0;
        for (let iy = minY + 1; iy < maxY; iy++) {
            if (!board.isEmpty(x, iy)) {
                blockerCount++;
            }
        }

        // 如果只有一个遮挡物，且就是当前位置的棋子，返回 true
        return blockerCount === 1;
    }
}
