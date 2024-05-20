import { Prisma } from '@prisma/client';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class PayloadDto {
  @IsInt()
  userId: string;

  @IsString()
  email: string;
}

export class PayloadForValidateDto {
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  password?: string;
}

export interface RegisterUserDto extends Prisma.UserCreateInput {
  accessToken?: string;
}

export class UserAuthPayload {
  @IsString()
  email: string;

  @IsString()
  userName: string;

  @IsString()
  provider: string;

  @IsOptional()
  @IsString()
  userImage?: string;

  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
