import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from './schema/players.schema';

@Injectable()
export class PlayersService {
  constructor(@InjectModel(Player.name) private playerModel: Model<PlayerDocument>) {}

  async findByTeamId(teamId: string): Promise<Player[]> {
    console.log("Buscando jugadores para teamId:", teamId); // Log para depuración
    return this.playerModel.find({ team_id: teamId }).exec();
  }

  async findByIds(ids: string[]): Promise<Player[]> {
    console.log("Buscando jugadores por IDs", ids);
    return this.playerModel.find({ _id: { $in: ids } }).exec();
  }

  async findAll(): Promise<Player[]> {
    // Return all players in the collection
    return this.playerModel.find().exec();
  }

  async create(playerData: any): Promise<Player> {
    console.log("Creando jugador con datos:", playerData);
    const newPlayer = new this.playerModel(playerData);
    return newPlayer.save();
  }

  async delete(id: string): Promise<any> {
    // Primero verifica si el jugador existe
    const player = await this.playerModel.findById(id);
    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }
    
    // También puedes eliminar las estadísticas relacionadas con este jugador si es necesario
    
    // Eliminar el jugador
    return this.playerModel.findByIdAndDelete(id);
  }

  async update(id: string, updatePlayerDto: any): Promise<Player | null> {
    // Verificar si el jugador existe
    const player = await this.playerModel.findById(id);
    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }
    
    // Actualizar y devolver el jugador actualizado
    return this.playerModel.findByIdAndUpdate(
      id, 
      { $set: updatePlayerDto },
      { new: true } // Para devolver el documento actualizado
    ).exec();
  }
}