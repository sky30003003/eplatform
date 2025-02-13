import { UserType } from './entities/user.entity';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(req: any, userType?: UserType): Promise<import("./entities/user.entity").User[]>;
}
