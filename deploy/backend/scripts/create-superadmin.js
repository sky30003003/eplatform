"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const argon2 = require("argon2");
const uuid_1 = require("uuid");
const dotenv_1 = require("dotenv");
const user_entity_1 = require("../users/entities/user.entity");
const organization_entity_1 = require("../organizations/entities/organization.entity");
const refresh_token_entity_1 = require("../auth/entities/refresh-token.entity");
const verification_token_entity_1 = require("../auth/entities/verification-token.entity");
(0, dotenv_1.config)();
const AppDataSource = new typeorm_1.DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [user_entity_1.User, organization_entity_1.Organization, refresh_token_entity_1.RefreshToken, verification_token_entity_1.VerificationToken],
    synchronize: false,
});
async function createSuperAdmin() {
    try {
        await AppDataSource.initialize();
        console.log('📦 Conexiune la baza de date stabilită');
        const userRepository = AppDataSource.getRepository(user_entity_1.User);
        const existingSuperAdmin = await userRepository.findOne({
            where: { userType: user_entity_1.UserType.SUPERADMIN }
        });
        if (existingSuperAdmin) {
            console.log('⚠️  Un superadmin există deja în baza de date');
            return;
        }
        const tempPassword = process.env.SUPERADMIN_PASSWORD || 'Admin123!@#';
        const passwordHash = await argon2.hash(tempPassword);
        const superAdmin = userRepository.create({
            id: (0, uuid_1.v4)(),
            email: process.env.SUPERADMIN_EMAIL || 'admin@eplatform.com',
            passwordHash,
            firstName: 'Super',
            lastName: 'Admin',
            phone: '0740000000',
            personalCode: 'SA001',
            userType: user_entity_1.UserType.SUPERADMIN,
            status: user_entity_1.UserStatus.ACTIVE,
            isEmailVerified: true
        });
        await userRepository.save(superAdmin);
        console.log('✅ Superadmin creat cu succes');
        console.log('📧 Email:', superAdmin.email);
        console.log('🔑 Parola temporară:', tempPassword);
        console.log('⚠️  Vă rugăm să schimbați parola la prima autentificare!');
    }
    catch (error) {
        console.error('❌ Eroare la crearea superadmin-ului:', error);
        process.exit(1);
    }
    finally {
        await AppDataSource.destroy();
    }
}
createSuperAdmin();
//# sourceMappingURL=create-superadmin.js.map