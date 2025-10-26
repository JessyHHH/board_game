import WebSocket from 'ws';
import { WEBSOCKET_STATUS } from '../common/common-type';
import { MessageHandler } from './message-handler';
import { UserEntity } from '../users/entities/user.entity';

const MAX_CONNECTION_TIME = 1000 * 60 * 60 * 24; // 24 hours
const MAX_INACTIVE_TIME_CLIENT = 1000 * 60 * 5; // 5 minutes

export class ClientConnection {
    private userEntity: UserEntity;
    private client: WebSocket;
    private status: WEBSOCKET_STATUS = WEBSOCKET_STATUS.CONNECTED;
    private latestActivedAt: number = Date.now();
    private createdAt: number = Date.now();

    constructor(userEntity: UserEntity, client: WebSocket) {
        this.userEntity = userEntity;
        this.client = client;
    }

    public getUserId() {
        return this.userEntity.id;
    }

    public getUserEntity() {
        return this.userEntity;
    }

    public initialize() {
        // ping pong 是维持心跳用的
        this.client.on('pong', () => {
            if (this.status === WEBSOCKET_STATUS.DISCONNECTED) {
                return;
            }

            this.latestActivedAt = Date.now();
        });

        this.client.on('error', (error) => {
            console.error(`client ${this.userEntity.id} error`, error);

            this.status = WEBSOCKET_STATUS.DISCONNECTED;
        });

        this.client.on('close', (code: number, reason: string) => {
            console.error(`client ${this.userEntity.id} close`, code, reason);

            this.status = WEBSOCKET_STATUS.DISCONNECTED;
        });

        this.client.on('message', (message: Buffer) => {
            if (this.status === WEBSOCKET_STATUS.DISCONNECTED) {
                return;
            }

            this.latestActivedAt = Date.now();

            try {
                const data = JSON.parse(message.toString());
                MessageHandler.handle(this, data);
            } catch (error) {
                console.error(`client ${this.userEntity.id} message error`, error);
            }

            console.log(`client ${this.userEntity.id} message`, message.toString());
        });
    }

    public canClose() {
        if (this.status === WEBSOCKET_STATUS.DISCONNECTED) {
            return true;
        }

        if (Date.now() - this.createdAt > MAX_CONNECTION_TIME) {
            return true;
        }

        return Date.now() - this.latestActivedAt > MAX_INACTIVE_TIME_CLIENT;
    }

    public close() {
        this.status = WEBSOCKET_STATUS.DISCONNECTED;

        this.client.close();
    }

    public send(message: string) {
        if (this.status === WEBSOCKET_STATUS.DISCONNECTED) {
            return;
        }

        this.client.send(message);
    }

    public ping() {
        if (this.status === WEBSOCKET_STATUS.DISCONNECTED) {
            return;
        }

        this.client.ping();
    }
}
