import { Controller, Post, Get, Patch, Param, Body, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-psw.dto';
import { isValidObjectId } from 'mongoose';

// http://localhost:3001/users
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Ruta completa: POST http://localhost:3001/users/register
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  // Ruta completa: POST http://localhost:3001/users/login
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.usersService.validateUser(loginUserDto.email, loginUserDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  // Ruta completa: GET http://localhost:3001/users/:id
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    try {
      if (!isValidObjectId(id)) {
        throw new BadRequestException('Invalid user ID format');
      }
      const user = await this.usersService.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('User not found');
      }
      throw error;
    }
  }

  // Ruta: PATCH http://localhost:3001/users/:id
  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    console.log('Updating user:', id, updateUserDto);
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID format');
    }
    try {
      return await this.usersService.update(id, updateUserDto);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Ruta: PATCH http://localhost:3001/users/:id/change-password
  @Post(':id/change-password')
  async changePassword(
    @Param('id') id: string, 
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    try {
      return await this.usersService.changePassword(id, changePasswordDto.currentPassword, changePasswordDto.newPassword);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }
}