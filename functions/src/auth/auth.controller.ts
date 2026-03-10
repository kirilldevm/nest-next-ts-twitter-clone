import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SigninDto } from './dto/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() signupForm: CreateUserDto) {
    return this.authService.signup(signupForm);
  }

  @Post('signin')
  signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @Post('signin-with-google')
  signinWithGoogle(@Body() signinDto: SigninDto) {
    return this.authService.signInWithGoogle(signinDto);
  }
}
