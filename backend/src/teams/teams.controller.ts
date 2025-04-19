import { Controller, Post, Get, Param, Body, UnauthorizedException, Patch, BadRequestException, Delete } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { isValidObjectId } from 'mongoose';
import { UpdateTeamDto } from './dto/update-team.dto';

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

  @Get(':id')
  async getTeamById(@Param('id') id: string) {
    console.log("Buscando equipo con ID:", id); // Log para depuración
    return this.teamsService.findById(id);
  }

  @Post()
  async createTeam(@Body() createTeamDto: any) {
    console.log("Datos recibidos para crear equipo:", createTeamDto);
    return this.teamsService.create(createTeamDto);
  }

  @Patch(':id/stats')
  async updateTeamStats(
    @Param('id') id: string,
    @Body() statsUpdate: { incrementWins?: number; incrementLosses?: number; incrementDraws?: number }
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`ID de equipo inválido: ${id}`);
    }
    
    return this.teamsService.updateStats(id, statsUpdate);
  }

  @Delete(':id')
  async deleteTeam(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`ID de equipo inválido: ${id}`);
    }
    
    return this.teamsService.remove(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`ID de equipo inválido: ${id}`);
    }
    
    return this.teamsService.update(id, updateTeamDto);
  }
}