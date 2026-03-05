import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private getResend(): Resend {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is required. Add it to your .env file.');
    }
    return new Resend(apiKey);
  }

  async sendVerificationLink(email: string) {
    const verificationLink = await admin
      .auth()
      .generateEmailVerificationLink(email);

    const verifyUrl = new URL(verificationLink);
    const frontedUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
    const oobCode = verifyUrl.searchParams.get('oobCode');
    const verifyLink = `${frontedUrl}/verify-email?oobCode=${oobCode}`;

    const from = process.env.RESEND_FROM || 'noreply@twitterclone.dev';
    await this.getResend().emails.send({
      from: `Twitter Clone <${from}>`,
      to: email,
      subject: 'Verify your email',
      html: `<div>
        <h1>Verify your email</h1>
        <p>Click <a href="${verifyLink}">here</a> to verify your email</p>
      </div>`,
    });
  }
}
