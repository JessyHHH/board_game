import { ClientConnection } from '../ws/client-connection';

export abstract class GameRoom {
    public constructor(
        public roomId: string,
        public clients: ClientConnection[],
    ) {}

    public abstract initialize(): void;
    public abstract join(clientConnection: ClientConnection): void;
    public abstract handleInput(clientConnection: ClientConnection, input: any): void;

    public getRoomId() {
        return this.roomId;
    }
}
