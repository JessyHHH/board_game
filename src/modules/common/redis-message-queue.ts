import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

//需要发送status, users, winner and loser, roomId
export interface QueueMessage {
    status: string;
    data: any;
    timestamp: number;
}

@Injectable()
export class RedisMessageQueueService {
    private readonly redis: Redis;

    constructor(private readonly redisService: RedisService) {
        this.redis = this.redisService.getOrThrow();
    }

    public async publish(channel: string, message: Omit<QueueMessage, 'timestamp'>) {
        const fullMessage: QueueMessage = {
            ...message,
            timestamp: Date.now(),
        };

        const subscriberCount = await this.redis.publish(channel, JSON.stringify(fullMessage));

        console.log(`Published message to ${channel}: ${JSON.stringify(fullMessage)}`);
        return subscriberCount;
    }
}
