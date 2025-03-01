import { UserRole } from '@prisma/client';

export class CreateUserDto {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export class UpdateUserDto {
  email?: string;
  name?: string;
  role?: UserRole;
}

export class UserResponseDto {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  organizationId: number;
  createdAt: Date;
  updatedAt: Date;
}
