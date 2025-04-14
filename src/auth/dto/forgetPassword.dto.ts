import {  MinLength } from 'class-validator';

export class ForgetPassword {

  @MinLength(5, { message: 'Password must be at least 5 characters' })
  password!: string;


}