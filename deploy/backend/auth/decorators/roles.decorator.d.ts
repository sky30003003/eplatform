import { UserType } from '../../users/entities/user.entity';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: UserType[]) => import("@nestjs/common").CustomDecorator<string>;
