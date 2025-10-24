import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity({ name: 'user_tokens' })
@Unique(['userId'])
@Unique(['token'])
@Unique(['macKey'])
export class UserTokenEntity extends BaseEntity<UserTokenEntity> {
    @Column({ name: 'user_id' })
    public userId: number;

    @Column()
    public token: string;

    @Column({ name: 'mac_key' })
    public macKey: string;

    public constructor(partial: Partial<UserTokenEntity>) {
        super();

        Object.assign(this, partial);
    }
}
