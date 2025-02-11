import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsFirstLoginToUser1707669600000 implements MigrationInterface {
    name = 'AddIsFirstLoginToUser1707669600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`isFirstLogin\` boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`isFirstLogin\``);
    }
} 