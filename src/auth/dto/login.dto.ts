import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email is not valid' })
  email!: string ;

  @MinLength(5, { message: 'Password must be at least 6 characters' })
    password!: string;
}
