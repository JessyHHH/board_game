import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) {}

    public async getUserByUsername(username: string): Promise<UserEntity | null> {
        return await this.userRepository.findOne({
            where: { username },
        });
    }

    public async getUserById(userId: number): Promise<UserEntity | null> {
        return await this.userRepository.findOne({
            where: { id: userId },
        });
    }
}
