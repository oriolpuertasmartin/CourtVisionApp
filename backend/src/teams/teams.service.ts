import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team, TeamDocument } from './schema/teams.schema' 

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
  ) {}

  async findByUserId(userId: string): Promise<Team[]> {
    return this.teamModel.find({ user_id: userId }).exec();
  }

  async findById(id: string): Promise<Team | null> {
    return this.teamModel.findById(id).exec();
  }
}