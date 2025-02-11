import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

interface EmailJob {
  to: string;
  subject: string;
  html: string;
  attempts?: number;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private readonly maxRetries = 3;
  private readonly rateLimitPerHour = 100; // Ajustabil în funcție de necesități

  constructor(
    private configService: ConfigService,
    @InjectQueue('email') private emailQueue: Queue
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: true,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  private async addToQueue(emailJob: EmailJob) {
    try {
      await this.emailQueue.add('send-email', emailJob, {
        attempts: this.maxRetries,
        backoff: {
          type: 'exponential',
          delay: 1000, // Delay inițial de 1 secundă
        },
        removeOnComplete: true,
        removeOnFail: false,
      });
    } catch (error) {
      this.logger.error(`Failed to add email to queue: ${error.message}`);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    
    await this.emailQueue.add('password-reset-email', {
      to: email,
      subject: 'Resetare parolă',
      template: 'password-reset',
      context: {
        resetUrl,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
    
    await this.emailQueue.add('verification-email', {
      to: email,
      subject: 'Verifică adresa de email',
      template: 'verification',
      context: {
        verificationUrl,
      },
    });
  }

  // Procesator pentru job-uri din coadă
  async processEmail(job: { data: EmailJob }) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        ...job.data,
      });
      
      this.logger.log(`Email sent successfully to ${job.data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error; // Bull va reîncerca automat
    }
  }
} 