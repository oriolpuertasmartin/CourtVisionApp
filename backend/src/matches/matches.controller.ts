import { Controller, Post, Patch, Get, Param, Body, BadRequestException, NotFoundException } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { isValidObjectId } from 'mongoose';

@Controller('matches')
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) {}

    // Ruta completa: POST http://localhost:3001/matches
    @Post()
    async createMatch(@Body() createMatchDto: CreateMatchDto) {
    console.log("Datos recibidos en createMatch:", createMatchDto); // Log para depuración
    if (!createMatchDto.teamId || !createMatchDto.userId) {
        throw new BadRequestException('teamId and userId are required');
    }
    return this.matchesService.create(createMatchDto);
    }

    // Obtener un partido por su ID
    @Get(':id')
    async getMatchById(@Param('id') id: string) {
      if (!isValidObjectId(id)) {
        throw new BadRequestException(`Invalid match ID: ${id}`);
      }
      const match = await this.matchesService.update(id, {});
      if (!match) {
        throw new NotFoundException(`Match with ID ${id} not found`);
      }
      return match;
    }

    // Nueva ruta: PATCH http://localhost:3001/matches/:id
    @Patch(':id')
    async updateMatch(
    @Param('id') id: string,
    @Body() updateMatchDto: UpdateMatchDto,
    ) {
    console.log('Datos recibidos para actualizar:', updateMatchDto); // Log para depuración
    if (!isValidObjectId(id)) {
        throw new BadRequestException(`Invalid match ID: ${id}`);
    }
    return this.matchesService.update(id, updateMatchDto);
    }

    // Nuevo endpoint para actualizar un periodo específico del partido
    @Patch(':id/period')
    async updatePeriodStats(
      @Param('id') id: string,
      @Body() periodStats: {
        period: string;
        teamAScore: number;
        teamBScore: number;
        teamAFouls: number;
        teamBFouls: number;
      },
    ) {
      if (!isValidObjectId(id)) {
        throw new BadRequestException(`Invalid match ID: ${id}`);
      }
      
      const result = await this.matchesService.updatePeriodStats(id, periodStats);
      if (!result) {
        throw new NotFoundException(`Match with ID ${id} not found`);
      }
      
      return result;
    }

    // Nuevo endpoint para obtener el historial de periodos
    @Get(':id/periods')
    async getPeriodHistory(@Param('id') id: string) {
      if (!isValidObjectId(id)) {
        throw new BadRequestException(`Invalid match ID: ${id}`);
      }
      
      const history = await this.matchesService.getPeriodHistory(id);
      if (!history) {
        throw new NotFoundException(`Match with ID ${id} not found`);
      }
      
      return history;
    }
}