import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserType } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(currentUser: User, userType?: UserType): Promise<User[]> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization');

    if (userType) {
      queryBuilder.andWhere('user.userType = :userType', { userType });
    }

    if (currentUser.userType === UserType.ORGADMIN) {
      queryBuilder.andWhere('user.organizationId = :organizationId', {
        organizationId: currentUser.organizationId,
      });
    }

    return queryBuilder.getMany();
  }
} 