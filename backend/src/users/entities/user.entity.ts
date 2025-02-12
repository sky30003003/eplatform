import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { VerificationToken } from '../../auth/entities/verification-token.entity';

export enum UserType {
  SUPERADMIN = 'SUPERADMIN',
  ORGADMIN = 'ORGADMIN',
  ADMIN = 'ADMIN',
  COLLABORATOR = 'COLLABORATOR',
  EMPLOYEE = 'EMPLOYEE'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  personalCode: string;

  @Column({
    type: 'enum',
    enum: UserType
  })
  userType: UserType;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  status: UserStatus;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, default: true })
  isFirstLogin?: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RefreshToken, token => token.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => VerificationToken, token => token.user)
  verificationTokens: VerificationToken[];
} 