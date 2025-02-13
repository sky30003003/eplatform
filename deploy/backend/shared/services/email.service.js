"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const bull_1 = require("@nestjs/bull");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService, emailQueue) {
        this.configService = configService;
        this.emailQueue = emailQueue;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.maxRetries = 3;
        this.rateLimitPerHour = 100;
        this.initializeTransporter();
    }
    initializeTransporter() {
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
    async addToQueue(emailJob) {
        try {
            await this.emailQueue.add('send-email', emailJob, {
                attempts: this.maxRetries,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            });
        }
        catch (error) {
            this.logger.error(`Failed to add email to queue: ${error.message}`);
            throw error;
        }
    }
    async sendPasswordResetEmail(email, token) {
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
    async sendVerificationEmail(email, token) {
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
    async processEmail(job) {
        try {
            await this.transporter.sendMail({
                from: this.configService.get('SMTP_FROM'),
                ...job.data,
            });
            this.logger.log(`Email sent successfully to ${job.data.to}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`);
            throw error;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bull_1.InjectQueue)('email')),
    __metadata("design:paramtypes", [config_1.ConfigService, Object])
], EmailService);
//# sourceMappingURL=email.service.js.map