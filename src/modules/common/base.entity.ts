import { AfterLoad, AfterInsert, PrimaryGeneratedColumn, Column } from 'typeorm';

export abstract class BaseEntity<T> {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({ name: 'created_at' })
    public createdAt: Date = new Date();

    @AfterLoad()
    @AfterInsert()
    public resetType() {
        this.id = Number(this.id);
    }
}

