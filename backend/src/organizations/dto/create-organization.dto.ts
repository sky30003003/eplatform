import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  companyCode: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
} 