import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { profileImageMulterOptions } from 'src/common/multer.config';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupFormDto } from './dto/signup-form.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UseInterceptors(FileInterceptor('profileImage', profileImageMulterOptions))
  signup(
    @Body() signupForm: SignupFormDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.authService.signupWithFile(signupForm, file);
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
