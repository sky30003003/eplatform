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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let EmailProcessor = class EmailProcessor {
    constructor(configService) {
        this.configService = configService;
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
    async handleVerificationEmail(job) {
        const { to, subject, template, context } = job.data;
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
    async handlePasswordResetEmail(job) {
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
};
exports.EmailProcessor = EmailProcessor;
__decorate([
    (0, bull_1.Process)('verification-email'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailProcessor.prototype, "handleVerificationEmail", null);
__decorate([
    (0, bull_1.Process)('password-reset-email'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailProcessor.prototype, "handlePasswordResetEmail", null);
exports.EmailProcessor = EmailProcessor = __decorate([
    (0, bull_1.Processor)('email'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailProcessor);
//# sourceMappingURL=email.processor.js.map