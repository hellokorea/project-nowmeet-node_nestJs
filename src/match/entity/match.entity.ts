import { User } from "src/users/entity/users.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sendMatches)
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMatches)
  receiver: User;

  @Column({ default: false })
  accepted: boolean;

  @CreateDateColumn()
  createdAt: string;
}
