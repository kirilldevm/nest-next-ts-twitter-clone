import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupFormDto } from './dto/signup-form.dto';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: multer.memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
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
