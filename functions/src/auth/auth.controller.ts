import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { SigninDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() signupForm: SignUpDto) {
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

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.checkEmailForPasswordReset(dto);
  }

  @Post('resend-verification-email')
  resendVerificationEmail(@Body() dto: ForgotPasswordDto) {
    return this.authService.resendVerificationEmail(dto);
  }
}
