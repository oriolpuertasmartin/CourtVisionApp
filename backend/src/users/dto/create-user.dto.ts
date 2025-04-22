import { IsNotEmpty, IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string;
    
    @IsNotEmpty()
    @IsString()
    readonly username: string;
    
    @IsNotEmpty()
    @IsString()
    readonly password: string;
    
    @IsNotEmpty()
    @IsEmail()
    readonly email: string;
    
    @IsOptional()
    @IsString()
    readonly phone?: string;
    
    @IsOptional()
    @IsString()
    readonly profile_photo?: string;
}