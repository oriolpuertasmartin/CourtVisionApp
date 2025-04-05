import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlayerStatsDocument = PlayerStats & Document;

@Schema()
export class PlayerStats {
  @Prop({ required: true })
  matchId: string;

  @Prop({ required: true })
  playerId: string;

  @Prop({ default: 0 })
  points: number;

  @Prop({ default: 0 })
  rebounds: number;

  @Prop({ default: 0 })
  assists: number;

  @Prop({ default: 0 })
  blocks: number;

  @Prop({ default: 0 })
  steals: number;

  @Prop({ default: 0 })
  turnovers: number;

  @Prop({ default: 0 })
  fieldGoalsMade: number;

  @Prop({ default: 0 })
  fieldGoalsAttempted: number;

  @Prop({ default: 0 })
  freeThrowsMade: number;

  @Prop({ default: 0 })
  freeThrowsAttempted: number;
}

export const PlayerStatsSchema = SchemaFactory.createForClass(PlayerStats);