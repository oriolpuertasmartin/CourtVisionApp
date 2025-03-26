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
      userId: createMatchDto.userId,
      winnerPoints: 0,
      loserPoints: 0,
      winnerTeam: createMatchDto.teamId,
      loserTeam: createMatchDto.opponentTeamId || "",
      date: new Date(),
      quarterScores: { winner: [0, 0, 0, 0], loser: [0, 0, 0, 0] },
    });
    return createdMatch.save(); // MongoDB generará automáticamente el _id
  }

  async update(id: string, updateMatchDto: UpdateMatchDto): Promise<Match | null> {
    return this.matchModel.findByIdAndUpdate(id, updateMatchDto, {
      new: true,
    }).exec();
  }
}