import { IsEmail, IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    readonly name?: string;
    
    @IsOptional()
    @IsEmail()
    readonly email?: string;
    
    @IsOptional()
    @IsString()
    readonly username?: string;
    
    @IsOptional()
    @IsString()
    readonly phone?: string;
    
    @IsOptional()
    @IsString()
    readonly profile_photo?: string;
}