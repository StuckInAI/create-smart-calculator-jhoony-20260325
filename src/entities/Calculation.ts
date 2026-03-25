import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Calculation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  expression: string;

  @Column('text')
  result: string;

  @Column('datetime')
  timestamp: Date;
}
