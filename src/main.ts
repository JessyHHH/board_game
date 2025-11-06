import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { WebSocket } from 'ws';
import { Socket } from 'net';
import { random, isString } from 'lodash';
import http from 'http';
import { ClientConnection } from './modules/ws/client-connection';
import { ClientManager } from './modules/ws/client-connection-manager';
import * as qs from 'querystring';
import { UserTokenService } from './modules/users/user-token.service';
import { UsersService } from './modules/users/users.service';
import { MESSAGE_TYPE } from './modules/common/common-type';

export let App: INestApplication;

async function bootstrap() {
    App = await NestFactory.create(AppModule);

    setupWebSocket(App);

    await App.listen(process.env.PORT ?? 3001);
}

function setupWebSocket(app: INestApplication) {
    const websocketServer = new WebSocket.Server({
        noServer: true,
    });

    // bind websocket to httpServer and handle upgrade manually
    const httpServer = app.getHttpServer();
    httpServer.on('upgrade', (request: http.IncomingMessage, socket: Socket, head: Buffer) => {
        websocketServer.handleUpgrade(request, socket, head, (ws: WebSocket) => {
            websocketServer.emit('connection', ws, request);
        });
    });

    /**
     * @socket 客户端的连接
     */
    websocketServer.on('connection', async (socket: WebSocket, request: any) => {
        const originQuery = request.url.slice(2);
        const query = qs.parse(originQuery);
        if (!query.token || !isString(query.token) || query.token.length !== 36) {
            console.error('Unauthorized', query);
            socket.close(1008, 'Unauthorized');
            return;
        }

        const userTokenEntity = await App.get<UserTokenService>(UserTokenService).getUserByToken(query.token as string);
        if (!userTokenEntity) {
            socket.close(1008, 'Unauthorized');
            return;
        }

        const userEntity = await App.get<UsersService>(UsersService).getUserById(userTokenEntity.userId);

        // 检查用户是否已连接
        if (ClientManager.hasClient(userEntity!.id)) {
            console.error(`user ${userEntity!.id} already connected`);
            socket.close(1008, 'Already connected');
            return;
        }

        const clientConnection = new ClientConnection(userEntity!, socket);
        ClientManager.register(clientConnection);
        //初始化
        clientConnection.initialize();

        ClientManager.sendMessage(userEntity!.id, {
            type: MESSAGE_TYPE.GAME_INIT,
        });

        console.log(`user ${userEntity!.id} connected`);
    });

    websocketServer.on('error', (error) => {
        console.error('websocket server error', error);
    });

    websocketServer.on('close', () => {
        console.error('websocket server close');
    });
}

bootstrap();
