import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity({ name: 'users' })
@Unique(['username'])
export class UserEntity extends BaseEntity<UserEntity> {
    @Column()
    public username: string;

    @Column({ name: 'updated_at' })
    public updatedAt: Date = new Date();

    /**
     * 它的作用是：初始化UserEntity对象时，将传入的partial对象的属性赋值给UserEntity对象
     * 这样可以避免手动设置每个属性，提高代码的可读性和可维护性
     * super()：是ES6中新增的语法，其作用是：调用父类的构造函数,在这里是调用BaseEntity的构造函数
     * partial对象：是传入的UserEntity对象的属性，其作用是：将传入的UserEntity对象的属性赋值给UserEntity对象
     * object.assign()：是ES6中新增的语法，其作用是：将partial对象的属性赋值给UserEntity对象
     */
    public constructor(partial: Partial<UserEntity>) {
        super();

        Object.assign(this, partial);
    }
}
