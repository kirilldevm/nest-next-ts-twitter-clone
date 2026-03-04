import { IsNotEmpty, IsString } from 'class-validator';

export class SigninDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}
