import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Logger } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserType } from '../users/entities/user.entity';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  private readonly logger = new Logger(OrganizationsController.name);

  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles(UserType.SUPERADMIN)
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    this.logger.debug('Request to create organization received');
    this.logger.debug('Request body:', JSON.stringify(createOrganizationDto, null, 2));
    
    try {
      return this.organizationsService.create(createOrganizationDto);
    } catch (error) {
      this.logger.error('Error creating organization:', error);
      if (error?.response?.message) {
        this.logger.error('Validation errors:', error.response.message);
      }
      throw error;
    }
  }

  @Get()
  @Roles(UserType.SUPERADMIN, UserType.ORGADMIN, UserType.ADMIN)
  findAll(@Request() req) {
    return this.organizationsService.findAll(req.user.userType, req.user.organizationId);
  }

  @Get(':id')
  @Roles(UserType.SUPERADMIN, UserType.ORGADMIN, UserType.ADMIN)
  findOne(@Param('id') id: string, @Request() req) {
    return this.organizationsService.findOne(id, req.user.userType, req.user.organizationId);
  }

  @Patch(':id')
  @Roles(UserType.SUPERADMIN, UserType.ORGADMIN)
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @Request() req
  ) {
    return this.organizationsService.update(
      id,
      updateOrganizationDto,
      req.user.userType,
      req.user.organizationId
    );
  }

  @Delete(':id')
  @Roles(UserType.SUPERADMIN)
  remove(@Param('id') id: string, @Request() req) {
    return this.organizationsService.remove(id, req.user.userType);
  }

  @Get(':id/admin')
  @Roles(UserType.SUPERADMIN)
  async getOrgAdmin(@Param('id') id: string) {
    return this.organizationsService.getOrgAdmin(id);
  }
} 