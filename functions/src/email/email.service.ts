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
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
    const frontendUrl = corsOrigin.split(',')[0].trim();
    const oobCode = verifyUrl.searchParams.get('oobCode');
    const verifyLink = `${frontendUrl}/verify-email?oobCode=${oobCode}`;

    // Use onboarding@resend.dev for testing (no domain verification needed)
    const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
    const { error } = await this.getResend().emails.send({
      from: `Twitter Clone <${from}>`,
      to: email,
      subject: 'Verify your email',
      html: `<div>
        <h1>Verify your email</h1>
        <p>Click <a href="${verifyLink}">here</a> to verify your email</p>
      </div>`,
    });

    if (error) {
      throw new Error(`Resend API: ${error.message} (${error.name})`);
    }
  }
}
