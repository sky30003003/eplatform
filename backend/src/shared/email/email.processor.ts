import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService } from '../services/email.service';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  @Process('send-email')
  async handleSendEmail(job: Job) {
    try {
      await this.emailService.processEmail(job);
      this.logger.log(`Processed email job ${job.id}`);
    } catch (error) {
      this.logger.error(`Failed to process email job ${job.id}: ${error.message}`);
      throw error;
    }
  }
} 