import { Controller, Get, Post, Delete, Patch, Param, Query, Body, NotFoundException, BadRequestException } from '@nestjs/common';
import { PlayersService } from './players.service';
import { isValidObjectId } from 'mongoose';

// http://localhost:3001/players
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  // GET http://localhost:3001/players/team/:teamId
  @Get('team/:teamId')
  async getPlayersByTeam(@Param('teamId') teamId: string) {
    console.log("Recibido teamId en controlador:", teamId);
    const players = await this.playersService.findByTeamId(teamId);
    // Devolver un arreglo vacío en lugar de lanzar una excepción
    return players || [];
  }

  // GET http://localhost:3001/players/:id
  @Get()
  async getPlayers(@Query('ids') ids?: string) {
    if (ids) {
      const playerIds = ids.split(',');
      const players = await this.playersService.findByIds(playerIds);
      if (!players || players.length === 0) {
        throw new NotFoundException('No players found for the specified IDs');
      }
      return players;
    } else {
      // Return all players if no ids provided
      return await this.playersService.findAll();
    }
  }

  // POST http://localhost:3001/players
  @Post()
  async createPlayer(@Body() createPlayerDto: any) {
    console.log("Datos recibidos para crear jugador:", createPlayerDto);
    
    if (!createPlayerDto.name || !createPlayerDto.number || !createPlayerDto.position || !createPlayerDto.team_id) {
      throw new BadRequestException('Name, number, position and team_id are required');
    }
    
    return this.playersService.create(createPlayerDto);
  }

  // DELETE http://localhost:3001/players/:id
  @Delete(':id')
  async deletePlayer(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid player ID: ${id}`);
    }
    return this.playersService.delete(id);
  }

  // PATCH http://localhost:3001/players/:id
  @Patch(':id')
  async updatePlayer(@Param('id') id: string, @Body() updatePlayerDto: any) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid player ID: ${id}`);
    }
    
    // Validar campos requeridos si se están actualizando
    if (updatePlayerDto.name === '' || updatePlayerDto.number === '' || updatePlayerDto.position === '') {
      throw new BadRequestException('Name, number, and position cannot be empty');
    }
    
    return this.playersService.update(id, updatePlayerDto);
  }
}