import { UserType } from '../../users/entities/user.entity';
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    personalCode: string;
    userType: UserType;
    organizationId?: string;
}
