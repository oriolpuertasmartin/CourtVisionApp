import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlayerStatsDocument = PlayerStats & Document;

@Schema()
export class PlayerStats {
  @Prop({ required: true })
  matchId: string; // ID del partido al que pertenecen las estadísticas

  @Prop({ required: true })
  playerId: string; // ID del jugador

  @Prop({ default: 0 })
  points: number; // Puntos anotados por el jugador

  @Prop({ default: 0 })
  rebounds: number; // Rebotes capturados por el jugador

  @Prop({ default: 0 })
  assists: number; // Asistencias realizadas por el jugador

  @Prop({ default: 0 })
  blocks: number; // Bloqueos realizados por el jugador

  @Prop({ default: 0 })
  steals: number; // Robos realizados por el jugador

  @Prop({ default: 0 })
  turnovers: number; // Pérdidas de balón del jugador

  @Prop({ default: 0 })
  fieldGoalsMade: number; // Tiros de campo anotados

  @Prop({ default: 0 })
  fieldGoalsAttempted: number; // Tiros de campo intentados

  @Prop({ default: 0 })
  freeThrowsMade: number; // Tiros libres anotados

  @Prop({ default: 0 })
  freeThrowsAttempted: number; // Tiros libres intentados
}

export const PlayerStatsSchema = SchemaFactory.createForClass(PlayerStats);