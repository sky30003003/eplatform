import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
interface EmailJob {
    to: string;
    subject: string;
    html: string;
    attempts?: number;
}
export declare class EmailService {
    private configService;
    private emailQueue;
    private readonly logger;
    private transporter;
    private readonly maxRetries;
    private readonly rateLimitPerHour;
    constructor(configService: ConfigService, emailQueue: Queue);
    private initializeTransporter;
    private addToQueue;
    sendPasswordResetEmail(email: string, token: string): Promise<void>;
    sendVerificationEmail(email: string, token: string): Promise<void>;
    processEmail(job: {
        data: EmailJob;
    }): Promise<void>;
}
export {};
