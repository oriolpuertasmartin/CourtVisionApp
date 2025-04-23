import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  readonly currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  readonly newPassword: string;
}