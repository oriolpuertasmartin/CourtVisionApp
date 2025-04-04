import { Controller, Post, Patch, Get, Param, Query, Body, BadRequestException } from '@nestjs/common';
import { PlayerstatsService } from './playerstats.service';
import { PlayerStats } from './schema/playerstats.schema';

@Controller('playerstats')
export class PlayerstatsController {
  constructor(private readonly playerstatsService: PlayerstatsService) {}

  @Post()
  async initializePlayerStats(@Body() body: { matchId: string; playerIds: string[] }) {
    console.log("Datos recibidos en /playerstats:", body); // Log para depuración
    const { matchId, playerIds } = body;
    if (!matchId || !playerIds || playerIds.length === 0) {
      throw new BadRequestException('matchId and playerIds are required');
    }
    return this.playerstatsService.initializeStats(matchId, playerIds);
  }

  @Patch(':id')
    async updatePlayerStats(
    @Param('id') id: string,
    @Body() statsUpdate: Partial<PlayerStats>,
    ) {
    console.log("ID recibido para actualizar estadísticas:", id); // Log para depuración
    console.log("Datos recibidos para actualizar estadísticas:", statsUpdate); // Log para depuración

    if (!id || Object.keys(statsUpdate).length === 0) {
        throw new BadRequestException('Player ID and stats update are required');
    }
    return this.playerstatsService.updateStats(id, statsUpdate);
    }

  @Get()
  async getPlayerStats(
    @Query('matchId') matchId: string,
    @Query('playerIds') playerIds: string,
  ) {
    if (!matchId || !playerIds) {
      throw new BadRequestException('matchId and playerIds are required');
    }
    const playerIdsArray = playerIds.split(',');
    return this.playerstatsService.getStats(matchId, playerIdsArray);
  }
}