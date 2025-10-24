import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTokenEntity } from './entities/user-token.entity';

@Injectable()
export class UserTokenService {
    constructor(@InjectRepository(UserTokenEntity) private readonly userTokenRepository: Repository<UserTokenEntity>) {}

    public async getUserByToken(token: string): Promise<UserTokenEntity | null> {
        return await this.userTokenRepository.findOne({
            where: { token },
        });
    }

    public async getUserByUserId(userId: number): Promise<UserTokenEntity | null> {
        return await this.userTokenRepository.findOne({
            where: { userId },
        });
    }
}
