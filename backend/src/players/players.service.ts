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
}