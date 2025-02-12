import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UserType } from '../users/entities/user.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    try {
      this.logger.debug('Creating organization with data:', createOrganizationDto);
      const organization = this.organizationsRepository.create(createOrganizationDto);
      this.logger.debug('Created organization entity:', organization);
      const savedOrg = await this.organizationsRepository.save(organization);
      this.logger.debug('Saved organization:', savedOrg);
      return savedOrg;
    } catch (error) {
      this.logger.error('Error creating organization:', error);
      throw error;
    }
  }

  async findAll(userType: UserType, organizationId?: string): Promise<Organization[]> {
    if (userType === UserType.SUPERADMIN) {
      return this.organizationsRepository.find();
    }
    
    if (!organizationId) {
      throw new ForbiddenException('Organization ID is required');
    }

    const organization = await this.organizationsRepository.findOne({
      where: { id: organizationId }
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return [organization];
  }

  async findOne(id: string, userType: UserType, userOrgId?: string): Promise<Organization> {
    // SUPERADMIN poate vedea orice organizație
    if (userType !== UserType.SUPERADMIN && userOrgId !== id) {
      throw new ForbiddenException('You can only access your own organization');
    }

    const organization = await this.organizationsRepository.findOne({
      where: { id },
      relations: ['users']
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(
    id: string, 
    updateOrganizationDto: UpdateOrganizationDto,
    userType: UserType,
    userOrgId?: string
  ): Promise<Organization> {
    // Doar SUPERADMIN poate actualiza orice organizație
    if (userType !== UserType.SUPERADMIN && userOrgId !== id) {
      throw new ForbiddenException('You can only update your own organization');
    }

    const organization = await this.findOne(id, userType, userOrgId);
    
    Object.assign(organization, updateOrganizationDto);
    return this.organizationsRepository.save(organization);
  }

  async remove(id: string, userType: UserType): Promise<void> {
    // Doar SUPERADMIN poate șterge organizații
    if (userType !== UserType.SUPERADMIN) {
      throw new ForbiddenException('Only SUPERADMIN can delete organizations');
    }

    const organization = await this.organizationsRepository.findOne({
      where: { id }
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    await this.organizationsRepository.remove(organization);
  }

  async getOrgAdmin(id: string): Promise<User | null> {
    const organization = await this.organizationsRepository.findOne({
      where: { id },
      relations: ['users']
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    const orgAdmin = organization.users.find(user => user.userType === UserType.ORGADMIN);
    return orgAdmin || null;
  }
} 