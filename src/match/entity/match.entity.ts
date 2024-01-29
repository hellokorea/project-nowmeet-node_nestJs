import { User } from "src/users/entity/users.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum MatchState {
  PENDING = "PENDING",
  MATCH = "MATCH",
  REJECT = "REJECT",
  EXPIRE = "EXPIRE",
}

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sendMatches)
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMatches)
  receiver: User;

  @Column({ type: "enum", enum: MatchState, default: MatchState.PENDING })
  status: string;

  @CreateDateColumn()
  createdAt: string;

  @Column()
  expireMatch: Date;
}
