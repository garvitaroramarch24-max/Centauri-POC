
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tasks') // This tells TypeORM to name the table "tasks" inside PostgreSQL
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid') // Automatically generates unique tracking IDs for every task
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isCompleted: boolean;

  @CreateDateColumn() // Automatically timestamps when the task is added
  createdAt: Date;
}
