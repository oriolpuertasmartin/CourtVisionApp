import { Controller, Post, Get, Param, Body, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

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
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}