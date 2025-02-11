import { Process, Processor } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import * as nodemailer from 'nodemailer';

@Processor('email')
export class EmailProcessor {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE', false),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  @Process('verification-email')
  async handleVerificationEmail(job: Job) {
    const { to, subject, template, context } = job.data;
    
    // În viitor, aici putem adăuga logică pentru template-uri HTML
    const html = `
      <h1>Verificare Email</h1>
      <p>Vă mulțumim pentru înregistrare!</p>
      <p>Click pe link-ul de mai jos pentru a vă verifica adresa de email:</p>
      <a href="${context.verificationUrl}">Verifică Email</a>
      <p>Link-ul expiră în 24 de ore.</p>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM'),
      to,
      subject,
      html,
    });
  }

  @Process('password-reset-email')
  async handlePasswordResetEmail(job: Job) {
    const { to, subject, template, context } = job.data;
    
    const html = `
      <h1>Resetare Parolă</h1>
      <p>Ați solicitat resetarea parolei pentru contul dvs.</p>
      <p>Click pe link-ul de mai jos pentru a vă reseta parola:</p>
      <a href="${context.resetUrl}">Resetează Parola</a>
      <p>Link-ul expiră în 1 oră.</p>
      <p>Dacă nu ați solicitat resetarea parolei, ignorați acest email.</p>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM'),
      to,
      subject,
      html,
    });
  }
} 