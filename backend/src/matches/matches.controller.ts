import { Controller, Post, Body, Patch, Param, BadRequestException } from '@nestjs/common';
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
}
