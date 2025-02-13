"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIsFirstLoginFix1739397595889 = void 0;
class AddIsFirstLoginFix1739397595889 {
    constructor() {
        this.name = 'AddIsFirstLoginFix1739397595889';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_refresh_tokens_user\``);
        await queryRunner.query(`ALTER TABLE \`verification_tokens\` DROP FOREIGN KEY \`FK_verification_tokens_user\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_users_organization\``);
        await queryRunner.query(`DROP INDEX \`IDX_users_email\` ON \`users\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`isFirstLogin\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` ADD \`userId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`verification_tokens\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`verification_tokens\` ADD \`userId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`organizationId\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`organizationId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`email\` \`email\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` ADD CONSTRAINT \`FK_610102b60fea1455310ccd299de\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`verification_tokens\` ADD CONSTRAINT \`FK_8eb720a87e85b20fdfc69c38269\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_f3d6aea8fcca58182b2e80ce979\` FOREIGN KEY (\`organizationId\`) REFERENCES \`organizations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_f3d6aea8fcca58182b2e80ce979\``);
        await queryRunner.query(`ALTER TABLE \`verification_tokens\` DROP FOREIGN KEY \`FK_8eb720a87e85b20fdfc69c38269\``);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_610102b60fea1455310ccd299de\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`email\` \`email\` varchar(255) COLLATE "utf8mb4_unicode_ci" NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`organizationId\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`organizationId\` varchar(36) COLLATE "utf8mb4_unicode_ci" NULL`);
        await queryRunner.query(`ALTER TABLE \`verification_tokens\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`verification_tokens\` ADD \`userId\` varchar(36) COLLATE "utf8mb4_unicode_ci" NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` ADD \`userId\` varchar(36) COLLATE "utf8mb4_unicode_ci" NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`isFirstLogin\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_users_email\` ON \`users\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_users_organization\` FOREIGN KEY (\`organizationId\`) REFERENCES \`organizations\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`verification_tokens\` ADD CONSTRAINT \`FK_verification_tokens_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` ADD CONSTRAINT \`FK_refresh_tokens_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}
exports.AddIsFirstLoginFix1739397595889 = AddIsFirstLoginFix1739397595889;
//# sourceMappingURL=1739397595889-AddIsFirstLoginFix.js.map