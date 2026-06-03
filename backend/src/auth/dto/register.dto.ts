import {
  IsEmail,
  IsNotEmpty,
} from 'class-validator';

export class RegisterDto {

  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  password!: string;

  @IsNotEmpty()
  role!: string;
}