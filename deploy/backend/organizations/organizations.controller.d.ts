import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
export declare class OrganizationsController {
    private readonly organizationsService;
    private readonly logger;
    constructor(organizationsService: OrganizationsService);
    create(createOrganizationDto: CreateOrganizationDto): Promise<import("./entities/organization.entity").Organization>;
    findAll(req: any): Promise<import("./entities/organization.entity").Organization[]>;
    findOne(id: string, req: any): Promise<import("./entities/organization.entity").Organization>;
    update(id: string, updateOrganizationDto: UpdateOrganizationDto, req: any): Promise<import("./entities/organization.entity").Organization>;
    remove(id: string, req: any): Promise<void>;
    getOrgAdmin(id: string): Promise<import("../users/entities/user.entity").User | null>;
}
