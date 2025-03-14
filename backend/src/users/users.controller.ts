import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

// http://localhost:3000/users
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Ruta completa: POST http://localhost:3000/users/register
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}