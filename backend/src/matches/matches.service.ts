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
    console.log('Actualizando partido con ID:', id);
    console.log('Datos recibidos para actualizar en el servicio:', updateMatchDto);
    return this.matchModel.findByIdAndUpdate(id, updateMatchDto, {
      new: true,
    }).exec();
  }

  // Nuevo método para actualizar y gestionar el historial de periodos
async updatePeriodStats(id: string, periodStats: {
  period: string;
  teamAScore: number;
  teamBScore: number;
  teamAFouls: number;
  teamBFouls: number;
}): Promise<Match | null> {
  const match = await this.matchModel.findById(id);
  
  if (!match) return null;
  
  // Inicializar periodsHistory si no existe
  if (!match.periodsHistory) {
    match.periodsHistory = [];
  }
  
  // Buscar si ya existe un registro para este periodo
  const existingPeriodIndex = match.periodsHistory.findIndex(
    p => p.period === periodStats.period
  );
  
  if (existingPeriodIndex >= 0) {
    // Actualizar el periodo existente
    match.periodsHistory[existingPeriodIndex] = periodStats;
  } else {
    // Agregar nuevo periodo
    match.periodsHistory.push(periodStats);
  }
  
  // Actualizar también los totales actuales
  match.teamAScore = periodStats.teamAScore;
  match.teamBScore = periodStats.teamBScore;
  match.teamAFouls = periodStats.teamAFouls;
  match.teamBFouls = periodStats.teamBFouls;
  match.currentPeriod = periodStats.period;
  
  try {
    return await match.save();
  } catch (error) {
    console.error('Error al guardar el partido:', error);
    throw error; // Re-lanzar el error para que el controlador pueda manejarlo
  }
}

  // Método para obtener el historial de periodos de un partido
  async getPeriodHistory(id: string): Promise<any> {
    const match = await this.matchModel.findById(id);
    if (!match) return null;
    
    return match.periodsHistory;
  }
}