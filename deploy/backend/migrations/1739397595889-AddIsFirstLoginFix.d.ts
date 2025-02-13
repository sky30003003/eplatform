import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddIsFirstLoginFix1739397595889 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
