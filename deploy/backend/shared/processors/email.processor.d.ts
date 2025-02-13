import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
export declare class EmailProcessor {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    handleVerificationEmail(job: Job): Promise<void>;
    handlePasswordResetEmail(job: Job): Promise<void>;
}
