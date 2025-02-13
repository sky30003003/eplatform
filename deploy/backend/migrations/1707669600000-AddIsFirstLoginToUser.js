"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIsFirstLoginToUser1707669600000 = void 0;
class AddIsFirstLoginToUser1707669600000 {
    constructor() {
        this.name = 'AddIsFirstLoginToUser1707669600000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`isFirstLogin\` boolean NOT NULL DEFAULT true`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`isFirstLogin\``);
    }
}
exports.AddIsFirstLoginToUser1707669600000 = AddIsFirstLoginToUser1707669600000;
//# sourceMappingURL=1707669600000-AddIsFirstLoginToUser.js.map