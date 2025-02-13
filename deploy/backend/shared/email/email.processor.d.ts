import { Job } from 'bull';
import { EmailService } from '../services/email.service';
export declare class EmailProcessor {
    private readonly emailService;
    private readonly logger;
    constructor(emailService: EmailService);
    handleSendEmail(job: Job): Promise<void>;
}
