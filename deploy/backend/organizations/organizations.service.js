"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OrganizationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const organization_entity_1 = require("./entities/organization.entity");
const user_entity_1 = require("../users/entities/user.entity");
const user_entity_2 = require("../users/entities/user.entity");
let OrganizationsService = OrganizationsService_1 = class OrganizationsService {
    constructor(organizationsRepository, usersRepository) {
        this.organizationsRepository = organizationsRepository;
        this.usersRepository = usersRepository;
        this.logger = new common_1.Logger(OrganizationsService_1.name);
    }
    async create(createOrganizationDto) {
        try {
            this.logger.debug('Creating organization with data:', createOrganizationDto);
            const organization = this.organizationsRepository.create(createOrganizationDto);
            this.logger.debug('Created organization entity:', organization);
            const savedOrg = await this.organizationsRepository.save(organization);
            this.logger.debug('Saved organization:', savedOrg);
            return savedOrg;
        }
        catch (error) {
            this.logger.error('Error creating organization:', error);
            throw error;
        }
    }
    async findAll(userType, organizationId) {
        if (userType === user_entity_1.UserType.SUPERADMIN) {
            return this.organizationsRepository.find();
        }
        if (!organizationId) {
            throw new common_1.ForbiddenException('Organization ID is required');
        }
        const organization = await this.organizationsRepository.findOne({
            where: { id: organizationId }
        });
        if (!organization) {
            throw new common_1.NotFoundException('Organization not found');
        }
        return [organization];
    }
    async findOne(id, userType, userOrgId) {
        if (userType !== user_entity_1.UserType.SUPERADMIN && userOrgId !== id) {
            throw new common_1.ForbiddenException('You can only access your own organization');
        }
        const organization = await this.organizationsRepository.findOne({
            where: { id },
            relations: ['users']
        });
        if (!organization) {
            throw new common_1.NotFoundException('Organization not found');
        }
        return organization;
    }
    async update(id, updateOrganizationDto, userType, userOrgId) {
        if (userType !== user_entity_1.UserType.SUPERADMIN && userOrgId !== id) {
            throw new common_1.ForbiddenException('You can only update your own organization');
        }
        const organization = await this.findOne(id, userType, userOrgId);
        Object.assign(organization, updateOrganizationDto);
        return this.organizationsRepository.save(organization);
    }
    async remove(id, userType) {
        if (userType !== user_entity_1.UserType.SUPERADMIN) {
            throw new common_1.ForbiddenException('Only SUPERADMIN can delete organizations');
        }
        const organization = await this.organizationsRepository.findOne({
            where: { id }
        });
        if (!organization) {
            throw new common_1.NotFoundException('Organization not found');
        }
        await this.organizationsRepository.remove(organization);
    }
    async getOrgAdmin(id) {
        const organization = await this.organizationsRepository.findOne({
            where: { id },
            relations: ['users']
        });
        if (!organization) {
            throw new common_1.NotFoundException(`Organization with ID ${id} not found`);
        }
        const orgAdmin = organization.users.find(user => user.userType === user_entity_1.UserType.ORGADMIN);
        return orgAdmin || null;
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = OrganizationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_2.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map