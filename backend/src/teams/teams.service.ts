import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Team, TeamDocument } from './schema/teams.schema'
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
  ) {}

  async findByUserId(userId: string): Promise<Team[]> {
    return this.teamModel.find({ userId: userId }).exec();
  }

  async findById(id: string): Promise<Team | null> {
    return this.teamModel.findById(id).exec();
  }

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const newTeam = new this.teamModel(createTeamDto);
    return newTeam.save();
  }

  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<Team | null> {
    return this.teamModel
      .findByIdAndUpdate(id, updateTeamDto, { new: true })
      .exec();
  }

  async findAll(): Promise<Team[]> {
    return this.teamModel.find().exec();
  }

  // Método para actualizar estadísticas del equipo
  async updateStats(id: string, statsUpdate: { 
    incrementWins?: number; 
    incrementLosses?: number;
  }): Promise<Team> {
    console.log("Stats Update recibido:", statsUpdate);
    console.log("ID de equipo:", id);
  
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`ID de equipo inválido: ${id}`);
    }
  
    const team = await this.teamModel.findById(id);
    
    console.log("Equipo encontrado:", team);
    
    if (!team) {
      throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    }
    
    // Incrementar victorias si es necesario
    if (statsUpdate.incrementWins && statsUpdate.incrementWins > 0) {
      console.log("Wins anteriores:", team.wins);
      team.wins = (team.wins || 0) + statsUpdate.incrementWins;
      console.log("Wins nuevas:", team.wins);
      team.gamesPlayed = (team.gamesPlayed || 0) + statsUpdate.incrementWins;
    }
    
    // Incrementar derrotas si es necesario
    if (statsUpdate.incrementLosses && statsUpdate.incrementLosses > 0) {
      console.log("Losses anteriores:", team.losses);
      team.losses = (team.losses || 0) + statsUpdate.incrementLosses;
      console.log("Losses nuevas:", team.losses);
      team.gamesPlayed = (team.gamesPlayed || 0) + statsUpdate.incrementLosses;
    }
    
    console.log("Equipo a guardar:", team);
    const savedTeam = await team.save();
    console.log("Equipo guardado:", savedTeam);
    return savedTeam;
  }

  async remove(id: string): Promise<Team | null> {
    const deletedTeam = await this.teamModel.findByIdAndDelete(id).exec();
    if (!deletedTeam) {
      throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    }
    return deletedTeam;
  }
}