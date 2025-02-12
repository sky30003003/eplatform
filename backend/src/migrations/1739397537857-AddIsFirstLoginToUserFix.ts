import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsFirstLoginToUserFix1739397537857 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificăm dacă coloana există deja
        const table = await queryRunner.getTable("users");
        const isFirstLoginColumn = table?.findColumnByName("isFirstLogin");
        
        if (!isFirstLoginColumn) {
            await queryRunner.query(
                `ALTER TABLE \`users\` ADD COLUMN \`isFirstLogin\` boolean NOT NULL DEFAULT true`
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`users\` DROP COLUMN \`isFirstLogin\``
        );
    }

}
