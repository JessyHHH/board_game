import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(private readonly userRepository: Repository<User>) {}

    public async getUserById(id: number): Promise<User | null> {
        return this.userRepository.findOne({
            where: {
                id,
            },
        });
    }

    public async getUserByUsername(username: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: {
                username,
            },
        });
    }

    public getUserRepository(): Repository<User> {
        return this.userRepository;
    }
}
