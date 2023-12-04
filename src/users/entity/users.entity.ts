import { Match } from "src/match/entity/match.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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

  @Column("simple-array")
  preference: string[];

  @Column({ default: 0 })
  gem: number;

  @Column({ default: false })
  ghostMode: boolean;

  @Column("decimal", { precision: 10, scale: 7, default: null })
  longitude: number;

  @Column("decimal", { precision: 10, scale: 7, default: null })
  latitude: number;

  @Column("simple-array")
  profileImages: string[];

  @CreateDateColumn()
  createdAt: string;

  @OneToMany(() => Match, (match) => match.sender)
  sendMatches: Match[];

  @OneToMany(() => Match, (match) => match.receiver)
  receivedMatches: Match[];
}
