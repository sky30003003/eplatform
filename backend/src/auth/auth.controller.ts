import { Controller, Post, Body, UseGuards, Request, Get, Param, Patch, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserType } from '../users/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {
    return this.authService.getCurrentUser(req.user.id);
  }

  // Endpoint-uri noi pentru crearea utilizatorilor de către administratori
  @Post('create-orgadmin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.SUPERADMIN)
  async createOrgAdmin(@Body() registerDto: RegisterDto) {
    return this.authService.createOrgAdmin(registerDto);
  }

  @Post('create-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.SUPERADMIN, UserType.ORGADMIN)
  async createUser(@Body() registerDto: RegisterDto, @Request() req) {
    return this.authService.createUser(registerDto, req.user);
  }

  @Patch('update-user/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.SUPERADMIN, UserType.ORGADMIN)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: any,
    @Request() req
  ) {
    return this.authService.updateUser(id, updateUserDto, req.user);
  }

  @Delete('delete-user/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.SUPERADMIN, UserType.ORGADMIN)
  async deleteUser(
    @Param('id') id: string,
    @Request() req
  ) {
    return this.authService.deleteUser(id, req.user);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req,
    @Body() dto: ChangePasswordDto
  ) {
    return this.authService.changePassword(req.user.id, dto);
  }
} 