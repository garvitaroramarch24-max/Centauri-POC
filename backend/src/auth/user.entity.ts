import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TaskEntity } from '../tasks/task.entity.js';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  username: string;

  @Column()
  passwordHash: string;

  @OneToMany(() => TaskEntity, (task) => task.owner)
  tasks: TaskEntity[];
}