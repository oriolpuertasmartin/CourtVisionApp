import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeamDocument = Team & Document;

@Schema()
export class Team {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;
  
  @Prop()
  team_photo: string;

  @Prop({ type: [String], default: [] })
  players: string[];

  @Prop({ default: 0 })
  gamesPlayed: number;

  @Prop({ default: 0 })
  wins: number;

  @Prop({ default: 0 })
  losses: number;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop()
  coach: string;

  @Prop({ default: 0 })
  nPlayers: number;

  @Prop({ type: [String], default: [] })
  matches: string[];

  @Prop({required: true})
  user_id: string;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
