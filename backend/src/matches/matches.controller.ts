import { Controller, Post, Body } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';

@Controller('matches')
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) {}

    // Ruta completa: POST http://localhost:3001/matches
    @Post()
    async createMatch(@Body() createMatchDto: CreateMatchDto) {
         // Llama al service para crear el partido
        const match = await this.matchesService.create(createMatchDto);
        return match; 
    }
}