"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialSchema1707669500000 = void 0;
class InitialSchema1707669500000 {
    constructor() {
        this.name = 'InitialSchema1707669500000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE \`organizations\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`phone\` varchar(255) NOT NULL,
                \`companyCode\` varchar(255) NOT NULL,
                \`avatarUrl\` varchar(255) NULL,
                \`status\` enum ('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` varchar(36) NOT NULL,
                \`organizationId\` varchar(36) NULL,
                \`email\` varchar(255) NOT NULL,
                \`passwordHash\` varchar(255) NOT NULL,
                \`firstName\` varchar(255) NOT NULL,
                \`lastName\` varchar(255) NOT NULL,
                \`phone\` varchar(255) NOT NULL,
                \`personalCode\` varchar(255) NULL,
                \`userType\` enum ('SUPERADMIN', 'ORGADMIN', 'ADMIN', 'COLLABORATOR', 'EMPLOYEE') NOT NULL,
                \`status\` enum ('ACTIVE', 'INACTIVE', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
                \`isEmailVerified\` tinyint NOT NULL DEFAULT 0,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_users_email\` (\`email\`),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_users_organization\` FOREIGN KEY (\`organizationId\`) REFERENCES \`organizations\` (\`id\`) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        await queryRunner.query(`
            CREATE TABLE \`refresh_tokens\` (
                \`id\` varchar(36) NOT NULL,
                \`userId\` varchar(36) NOT NULL,
                \`token\` varchar(255) NOT NULL,
                \`expiresAt\` datetime NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`isRevoked\` tinyint NOT NULL DEFAULT 0,
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_refresh_tokens_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        await queryRunner.query(`
            CREATE TABLE \`verification_tokens\` (
                \`id\` varchar(36) NOT NULL,
                \`userId\` varchar(36) NOT NULL,
                \`token\` varchar(255) NOT NULL,
                \`type\` enum ('PASSWORD_RESET', 'EMAIL_VERIFICATION') NOT NULL,
                \`expiresAt\` datetime NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`isUsed\` tinyint NOT NULL DEFAULT 0,
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_verification_tokens_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE \`verification_tokens\``);
        await queryRunner.query(`DROP TABLE \`refresh_tokens\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`organizations\``);
    }
}
exports.InitialSchema1707669500000 = InitialSchema1707669500000;
//# sourceMappingURL=1707669500000-InitialSchema.js.map