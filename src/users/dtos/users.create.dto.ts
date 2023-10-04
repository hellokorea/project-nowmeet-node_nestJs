import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

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
  preference: string[];

  @IsNotEmpty()
  latitude: number;

  @IsNotEmpty()
  longitude: number;
}
