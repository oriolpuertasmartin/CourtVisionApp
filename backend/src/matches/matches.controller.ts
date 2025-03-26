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
        const match = await this.matchesService.create(createMatchDto);
        return match;
    }

    // Nueva ruta: PATCH http://localhost:3001/matches/:id
    @Patch(':id')
    async updateMatch(
    @Param('id') id: string,
    @Body() updateMatchDto: UpdateMatchDto,
    ) {
    if (!isValidObjectId(id)) {
        throw new BadRequestException(`Invalid match ID: ${id}`);
    }
    return this.matchesService.update(id, updateMatchDto);
    }
}
