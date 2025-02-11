import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserType } from '../../users/entities/user.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: string;

  @IsString()
  personalCode: string;

  @IsEnum(UserType)
  userType: UserType;

  @IsOptional()
  @IsString()
  organizationId?: string;
} 