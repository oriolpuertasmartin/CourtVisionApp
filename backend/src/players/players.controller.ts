import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PlayersService } from './players.service';

// http://localhost:3001/players
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  // GET http://localhost:3001/players/team/:teamId
  @Get('team/:teamId')
  async getPlayersByTeam(@Param('teamId') teamId: string) {
  const players = await this.playersService.findByTeamId(teamId);
  if (!players || players.length === 0) {
    throw new NotFoundException('No players found for the specified team');
  }
    return players;
  }
}