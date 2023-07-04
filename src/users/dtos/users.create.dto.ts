import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UserRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

// class 를 쓰는 이유는 재사용성(상속) 및 데코레이터를 쓰기 위함
