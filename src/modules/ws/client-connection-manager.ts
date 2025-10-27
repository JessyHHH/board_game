import { ClientConnection } from './client-connection';

export class G_ClientConnectionManager {
    private clients: Map<number, ClientConnection> = new Map();

    public constructor() {
        setInterval(this.checkAndSetClient.bind(this), 5000);
    }

    public hasClient(userId: number) {
        return this.clients.has(userId);
    }

    public getClient(userId: number) {
        return this.clients.get(userId);
    }

    public register(client: ClientConnection) {
        const userId = client.getUserId();

        if (this.clients.has(userId)) {
            throw new Error(`client connection ${userId} already exists`);
        }

        this.clients.set(userId, client);
    }

    public sendMessage(userId: number, data: any) {
        const client = this.clients.get(userId);
        if (!!client) {
            //检查是否是字符串和二进制数据
            if (typeof data !== 'string' && !(data instanceof Buffer)) {
                data = JSON.stringify(data);
            }

            client.send(data);
        }
    }

    public checkAndSetClient() {
        this.clients.forEach((client, connectionId) => {
            if (client.canClose()) {
                client.close();

                this.clients.delete(connectionId);
            } else {
                client.ping();
            }
        });
    }

    public getClientCount() {
        return this.clients.size;
    }
}

// 全局单例
export const ClientManager = new G_ClientConnectionManager();
