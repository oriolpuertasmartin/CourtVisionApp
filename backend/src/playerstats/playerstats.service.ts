import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlayerStats, PlayerStatsDocument } from './schema/playerstats.schema';
import { v4 as uuidv4 } from 'uuid'; // Importar para generar un ID único

@Injectable()
export class PlayerstatsService {
  constructor(
    @InjectModel(PlayerStats.name) private playerStatsModel: Model<PlayerStatsDocument>,
  ) {}

  async initializeStats(matchId: string, playerIds: string[]): Promise<PlayerStats[]> {
    const stats = playerIds.map((playerId) => ({
      matchId,
      playerId,
      points: 0,
      rebounds: 0,
      assists: 0,
      blocks: 0,
      steals: 0,
      turnovers: 0,
      fieldGoalsMade: 0,
      fieldGoalsAttempted: 0,
      freeThrowsMade: 0,
      freeThrowsAttempted: 0,
    }));
    return this.playerStatsModel.insertMany(stats);
  }
  
  async initializeOpponentStats(matchId: string): Promise<PlayerStatsDocument> {
    const opponentStats = {
      matchId,
      playerId: 'opponent', // Identificador único para el equipo rival
      points: 0,
      rebounds: 0,
      assists: 0,
      blocks: 0,
      steals: 0,
      turnovers: 0,
      fieldGoalsMade: 0,
      fieldGoalsAttempted: 0,
      freeThrowsMade: 0,
      freeThrowsAttempted: 0,
    };
    return this.playerStatsModel.create(opponentStats);
  }

  async updateStats(playerStatsId: string, statsUpdate: Partial<PlayerStats>): Promise<PlayerStats> {
    console.log("Actualizando estadísticas para playerStatsId:", playerStatsId); // Log para depuración
    console.log("Datos recibidos para actualizar:", statsUpdate); // Log para depuración
  
    // Validar que los valores sean números
    const sanitizedUpdate = Object.fromEntries(
      Object.entries(statsUpdate).map(([key, value]) => [key, Number(value)])
    );
  
    const updatedStats = await this.playerStatsModel.findByIdAndUpdate(
      playerStatsId,
      { $inc: sanitizedUpdate },
      { new: true },
    ).exec();
  
    if (!updatedStats) {
      throw new NotFoundException(`PlayerStats con ID ${playerStatsId} no encontrado`);
    }
  
    return updatedStats;
  }
  
  
  async getStats(matchId: string, playerIds: string[]): Promise<PlayerStats[]> {
    const stats = await this.playerStatsModel.find({ matchId, playerId: { $in: playerIds } }).exec();
    if (!stats || stats.length === 0) {
      throw new NotFoundException('No player stats found for the given matchId and playerIds');
    }
    return stats;
  }
}