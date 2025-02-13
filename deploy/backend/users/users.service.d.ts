import { Repository } from 'typeorm';
import { User, UserType } from './entities/user.entity';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findAll(currentUser: User, userType?: UserType): Promise<User[]>;
}
