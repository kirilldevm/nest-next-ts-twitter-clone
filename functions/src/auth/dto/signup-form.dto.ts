import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupFormDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  // @IsOptional()
  // @IsString()
  // profileImageUrl?: string;
}
