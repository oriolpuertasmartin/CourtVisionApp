import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MatchDocument = Match & Document;

@Schema()
export class Match {
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId; // Referencia a la colección `teams`

  @Prop({ type: String, required: true })
  userId: string; // ID del usuario que creó el partido

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

  // Propiedades para el marcador total actual
  @Prop({ default: 0 })
  teamAScore: number;

  @Prop({ default: 0 })
  teamBScore: number;

  @Prop({ default: 0 })
  teamAFouls: number;

  @Prop({ default: 0 })
  teamBFouls: number;

  @Prop({ default: 'H1' })
  currentPeriod: string;

  // Historial de periodos para guardar el marcador por cuartos
  @Prop({
    type: [{
      period: { type: String, required: true }, // H1, H2, OT1, etc.
      teamAScore: { type: Number, default: 0 },
      teamBScore: { type: Number, default: 0 },
      teamAFouls: { type: Number, default: 0 },
      teamBFouls: { type: Number, default: 0 },
    }],
    default: []
  })
  periodsHistory: {
    period: string;
    teamAScore: number;
    teamBScore: number;
    teamAFouls: number;
    teamBFouls: number;
  }[];

  @Prop({ type: String, default: 'in_progress' }) // in_progress, completed
  status: string;
}

export const MatchSchema = SchemaFactory.createForClass(Match);