import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @Column({ unique: true })
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  nickName: string;

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
}
