import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UserCreateDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  sex: string;

  @IsString()
  @IsNotEmpty()
  birthDate: string;

  @IsString()
  @IsNotEmpty()
  tall: string;

  @IsString()
  @IsNotEmpty()
  job: string;

  @IsString()
  @IsNotEmpty()
  introduce: string;

  @IsString()
  @IsNotEmpty()
  preference: string;

  @IsString()
  profileImage: string;
}
