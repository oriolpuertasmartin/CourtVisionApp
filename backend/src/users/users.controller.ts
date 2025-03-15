import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

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
}