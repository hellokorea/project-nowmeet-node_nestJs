import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatRoom } from "./chat.entity";
import { User } from "src/users/database/entity/users.entity";

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.message)
  @JoinColumn({ name: "chatRoomId" })
  chatRoom: ChatRoom;

  @ManyToOne(() => User)
  @JoinColumn({ name: "senderId" })
  sender: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "receiverId" })
  receiver: User;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: string;
}
