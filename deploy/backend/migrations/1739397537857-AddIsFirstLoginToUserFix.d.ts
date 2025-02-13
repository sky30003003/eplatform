import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddIsFirstLoginToUserFix1739397537857 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
