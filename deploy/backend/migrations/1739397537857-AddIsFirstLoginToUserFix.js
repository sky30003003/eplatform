"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIsFirstLoginToUserFix1739397537857 = void 0;
class AddIsFirstLoginToUserFix1739397537857 {
    async up(queryRunner) {
        const table = await queryRunner.getTable("users");
        const isFirstLoginColumn = table?.findColumnByName("isFirstLogin");
        if (!isFirstLoginColumn) {
            await queryRunner.query(`ALTER TABLE \`users\` ADD COLUMN \`isFirstLogin\` boolean NOT NULL DEFAULT true`);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`isFirstLogin\``);
    }
}
exports.AddIsFirstLoginToUserFix1739397537857 = AddIsFirstLoginToUserFix1739397537857;
//# sourceMappingURL=1739397537857-AddIsFirstLoginToUserFix.js.map