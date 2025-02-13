import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UserType } from '../users/entities/user.entity';
import { User } from '../users/entities/user.entity';
export declare class OrganizationsService {
    private organizationsRepository;
    private usersRepository;
    private readonly logger;
    constructor(organizationsRepository: Repository<Organization>, usersRepository: Repository<User>);
    create(createOrganizationDto: CreateOrganizationDto): Promise<Organization>;
    findAll(userType: UserType, organizationId?: string): Promise<Organization[]>;
    findOne(id: string, userType: UserType, userOrgId?: string): Promise<Organization>;
    update(id: string, updateOrganizationDto: UpdateOrganizationDto, userType: UserType, userOrgId?: string): Promise<Organization>;
    remove(id: string, userType: UserType): Promise<void>;
    getOrgAdmin(id: string): Promise<User | null>;
}
