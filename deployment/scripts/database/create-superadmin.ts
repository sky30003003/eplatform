import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv';
import { User, UserType, UserStatus } from '../../backend/src/users/entities/user.entity';

// Încărcăm variabilele de mediu
const env = process.env.NODE_ENV || 'development';
config({ path: `deployment/config/${env}/backend.env` });

// Configurare conexiune la baza de date
const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User],
    synchronize: false,
});

async function createSuperAdmin() {
    try {
        // Inițializare conexiune
        await AppDataSource.initialize();
        console.log('📦 Conexiune la baza de date stabilită');

        const userRepository = AppDataSource.getRepository(User);

        // Verificăm dacă există deja un superadmin
        const existingSuperAdmin = await userRepository.findOne({
            where: { userType: UserType.SUPERADMIN }
        });

        if (existingSuperAdmin) {
            console.log('⚠️  Un superadmin există deja în baza de date');
            return;
        }

        // Generăm o parolă temporară dacă nu este specificată
        const tempPassword = process.env.SUPERADMIN_PASSWORD || 'Admin123!@#';
        const passwordHash = await argon2.hash(tempPassword);

        // Creăm superadmin-ul
        const superAdmin = userRepository.create({
            id: uuidv4(),
            email: process.env.SUPERADMIN_EMAIL || 'admin@eplatform.com',
            passwordHash,
            firstName: 'Super',
            lastName: 'Admin',
            phone: '0740000000',
            personalCode: 'SA001',
            userType: UserType.SUPERADMIN,
            status: UserStatus.ACTIVE,
            isEmailVerified: true,
            isFirstLogin: true
        });

        await userRepository.save(superAdmin);
        console.log('✅ Superadmin creat cu succes');
        console.log('📧 Email:', superAdmin.email);
        console.log('🔑 Parola temporară:', tempPassword);
        console.log('⚠️  Vă rugăm să schimbați parola la prima autentificare!');

    } catch (error) {
        console.error('❌ Eroare la crearea superadmin-ului:', error);
        process.exit(1);
    } finally {
        await AppDataSource.destroy();
    }
}

// Rulăm funcția
createSuperAdmin(); 