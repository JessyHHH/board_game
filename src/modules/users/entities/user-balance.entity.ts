import { AfterLoad, AfterInsert, Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity({ name: 'user_balance' })
export class UserBalanceEntity extends BaseEntity<UserBalanceEntity> {
    @Column({ name: 'user_id' })
    public userId: number;

    @Column({ name: 'balance' })
    public balance: number;

    @Column({ name: 'updated_at' })
    public updatedAt: Date = new Date();

    public constructor(partial: Partial<UserBalanceEntity>) {
        super();

        Object.assign(this, partial);
    }

    @AfterLoad()
    @AfterInsert()
    public resetType() {
        super.resetType();

        this.balance = Number(this.balance);
        this.userId = Number(this.userId);
    }
}
