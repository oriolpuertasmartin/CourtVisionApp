import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MatchDocument = Match & Document;

@Schema()
export class Match {
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId; // Referencia a la colección `teams`

  @Prop({
    type: {
      name: { type: String, required: true },
      category: { type: String, required: true },
      photo: { type: String },
      stats: {
        points: { type: Number, default: 0 },
        rebounds: { type: Number, default: 0 },
        assists: { type: Number, default: 0 },
        fieldGoalPercentage: { type: Number, default: 0 },
      },
    },
    required: true,
  })
  opponentTeam: {
    name: string;
    category: string;
    photo: string;
    stats: {
      points: number;
      rebounds: number;
      assists: number;
      fieldGoalPercentage: number;
    };
  };

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String })
  location: string;

  @Prop({ type: [Types.ObjectId], ref: 'Player', default: [] })
  startingPlayers: Types.ObjectId[]; // IDs de los jugadores titulares
}

export const MatchSchema = SchemaFactory.createForClass(Match);