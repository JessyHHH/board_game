import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GomokuService } from './gomoku.service';
import { WebSocketGateway } from '@nestjs/websockets';
import { MoveDto } from './dto/gomoku.dto';

@WebSocketGateway()
export class GomokuGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly gomokuService: GomokuService) {}
    afterInit(server: Server) {
        console.log('WebSocket server initialized');
    }

    //玩家连接
    public async handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }
    public async handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);

        const opponent = await this.gomokuService.handleDisconnect(client.id);
        if (opponent) {
            this.server.to(opponent).emit('opponent_disconnected', { message: 'opponent player disconnected' });
        }
    }

    @SubscribeMessage('match')
    public async handleMatch(client: Socket) {
        const result = await this.gomokuService.matchPlayer(client.id);

        //第一个玩家开始匹配第二个玩家
        if (!result.matched) {
            client.emit('match_pending', { message: 'waiting for opponent' });
            return;
        }

        //匹配成功
        const game = this.gomokuService['findGame'](client.id);
        const [player1, player2] = game?.player || [];

        //玩家1黑棋子
        this.server.to(player1).emit('game_start', {
            gameId: result.gameId,
            yourColor: 'black',
            yourTurn: true,
            opponent: player2,
        });
        //玩家2白棋子
        this.server.to(player2).emit('game_start', {
            gameId: result.gameId,
            yourColor: 'white',
            yourTurn: false,
            opponent: player1,
        });
    }

    //取消匹配
    @SubscribeMessage('cancel_match')
    public async handleCancelMatch(client: Socket) {
        await this.gomokuService.cancelMatch(client.id);
        client.emit('match_cancelled', { message: 'match cancelled' });
    }

    //下棋
    @SubscribeMessage('move')
    public async handleMove(client: Socket, moveDto: MoveDto) {
        const result = await this.gomokuService.makeMove(client.id, moveDto.x, moveDto.y);

        //下棋失败
        if (!result.success) {
            client.emit('move_error', { message: result.error });
            return;
        }

        //下棋成功
        const game = this.gomokuService['findGame'](client.id);
        const opponent = game?.player.find((p) => p !== client.id);

        const moveData = {
            x: moveDto.x,
            y: moveDto.y,
            board: game?.board,
            currentPlayer: game?.currentPlayer,
        };

        client.emit('move_result', moveData);
        if (opponent) {
            this.server.to(opponent).emit('move_result', moveData);
        }

        //游戏是否结束
        if (result.gameOver) {
            const gameOverData = {
                winner: result.winner,
                board: game?.board,
            };

            client.emit('game_over', gameOverData);
            if (opponent) {
                this.server.to(opponent).emit('game_over', gameOverData);
            }

            console.log(`Game over: ${result.winner} wins`);
        }
    }

    @SubscribeMessage('surrender')
    public async handleSurrender(client: Socket) {
        const game = this.gomokuService['findGame'](client.id);
        const opponent = game?.player.find((p) => p !== client.id);

        if (opponent) {
            this.server.to(opponent).emit('opponent_surrendered', { message: 'opponent surrendered' });
        }

        const gameOverData = {
            winner: 'opponent',
            board: game?.board,
        };

        client.emit('game_over', gameOverData);
        if (opponent) {
            this.server.to(opponent).emit('game_over', gameOverData);
        }

        console.log(`Game over: opponent surrendered`);
    }
}
