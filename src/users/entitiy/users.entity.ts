import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @Column({ unique: true })
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  nickname: string;

  @Column()
  sex: string;

  @Column()
  birthDate: string;

  @Column()
  tall: string;

  @Column()
  job: string;

  @Column()
  introduce: string;

  @Column()
  preference: string;

  @Column()
  profileImage: string;

  @CreateDateColumn()
  createdAt: string;
}
