// import { ClientConnection } from '../ws/client-connection';
import { App } from '../../../main';
import { RedisMessageQueueService } from '../../common/redis-message-queue';
import { ClientManager } from '../../ws/client-connection-manager';
import { GameRoomManager } from './game-room-manager';

export abstract class GameRoom {
    public isActive: boolean = true;
    protected joinedUserIds: number[] = [];
    protected messageQueueService: RedisMessageQueueService;
    // protected clients: ClientConnection[] = [];

    public constructor(
        protected roomId: string,
        protected userIds: number[],
    ) {
        this.messageQueueService = App.get<RedisMessageQueueService>(RedisMessageQueueService);
    }

    public abstract startGame(): void;

    public join(UserId: number): void {
        //添加client传入的userId到预定的room, 只有匹配上的人才能进入roomId，预先传入userId可以防治别的人知道roomId也能加入这个房间导致把别人user挤掉
        if (!this.userIds.includes(UserId)) {
            throw new Error(`userId ${UserId} is not in the room ${this.roomId}`);
        }

        //检查是否已加入
        if (this.joinedUserIds.includes(UserId)) {
            return;
        }

        this.joinedUserIds.push(UserId);

        if (this.joinedUserIds.length === this.userIds.length) {
            this.startGame();
        }
    }

    public abstract handleInput(userId: number, input: any): void;

    public getRoomId() {
        return this.roomId;
    }

    protected broadcastMessage(message: any) {
        for (const userId of this.joinedUserIds) {
            ClientManager.sendMessage(userId, message);
        }
    }

    // protected sendSingleMessage(userId: number, message: any) {
    //     const client = this.getClientByUserId(userId);
    //     if (client) {
    //         ClientManager.sendMessage(userId, message);
    //     }
    // }

    // protected getClientByUserId(userId: number) {
    //     return this.clients.find((client) => client.getUserId() === userId);
    // }

    protected destroy() {
        GameRoomManager.deleteRoom(this.roomId);
    }
}
