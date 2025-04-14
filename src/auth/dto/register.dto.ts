import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email is not valid' })
  email!: string;

  @MinLength(5, { message: 'Password must be at least 5 characters' })
  password!: string;

  @IsNotEmpty({ message: 'Name is required' })
  name!: string;
}
