import { Controller, Post, Get, Param, Body, UnauthorizedException } from '@nestjs/common';
import { TeamsService } from './teams.service';

// http://localhost:3001/users
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

   // Ruta completa: GET http://localhost:3001/teams/user/:userId
   @Get('user/:userId')
   async getTeamsByUser(@Param('userId') userId: string) {
    console.log("Recibido userId en controlador:", userId); // Log para depuración
    return this.teamsService.findByUserId(userId);
   }
}