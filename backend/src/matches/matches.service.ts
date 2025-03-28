import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from './schema/matches.schema';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
  ) {}

  async create(createMatchDto: CreateMatchDto): Promise<Match> {
    const createdMatch = new this.matchModel({
      teamId: createMatchDto.teamId,
      userId: createMatchDto.userId,
      opponentTeam: {
        name: 'Opponent', // Nombre vacío por defecto
        category: 'Category', // Categoría vacía por defecto
        photo: '', // Foto vacía por defecto
        stats: {
          points: 0,
          rebounds: 0,
          assists: 0,
          fieldGoalPercentage: 0,
        },
      },
      date: createMatchDto.date || new Date(), // Fecha actual si no se proporciona
      location: createMatchDto.location || '', // Ubicación vacía por defecto
    });
    return createdMatch.save();
  }

  async update(id: string, updateMatchDto: UpdateMatchDto): Promise<Match | null> {
    console.log('Actualizando partido con ID:', id); // Log para depuración
    console.log('Datos recibidos para actualizar en el servicio:', updateMatchDto); // Log para depuración
    return this.matchModel.findByIdAndUpdate(id, updateMatchDto, {
      new: true,
    }).exec();
  }
}