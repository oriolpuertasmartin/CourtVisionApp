import { Injectable } from '@nestjs/common';
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
}