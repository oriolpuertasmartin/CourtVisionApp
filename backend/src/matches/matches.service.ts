import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from './schema/matches.schema';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { PlayerstatsService } from '../playerstats/playerstats.service';
import { PlayerStatsDocument } from '../playerstats/schema/playerstats.schema';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    private readonly playerstatsService: PlayerstatsService,
  ) {}

  async create(createMatchDto: CreateMatchDto): Promise<Match> {
    const createdMatch = new this.matchModel({
      teamId: createMatchDto.teamId,
      userId: createMatchDto.userId,
      opponentTeam: {
        name: 'Opponent',
        category: 'Category',
        photo: '',
        stats: {
          points: 0,
          rebounds: 0,
          assists: 0,
          fieldGoalPercentage: 0,
        },
      },
      date: createMatchDto.date || new Date(),
      location: createMatchDto.location || '',
    });
  
    const match = await createdMatch.save();
  
    // Inicializar estadísticas del equipo rival
    const opponentStats = await this.playerstatsService.initializeOpponentStats(match.id) as PlayerStatsDocument;
  
    // Asignar el playerStatsId al equipo rival
    match.opponentTeam['playerStatsId'] = opponentStats._id;
  
    await match.save();
  
    return match;
  }

  async update(id: string, updateMatchDto: UpdateMatchDto): Promise<Match | null> {
    console.log('Actualizando partido con ID:', id); // Log para depuración
    console.log('Datos recibidos para actualizar en el servicio:', updateMatchDto); // Log para depuración
    return this.matchModel.findByIdAndUpdate(id, updateMatchDto, {
      new: true,
    }).exec();
  }
}