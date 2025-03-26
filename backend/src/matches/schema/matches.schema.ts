import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MatchDocument = Match & Document;

@Schema()
export class Match {
  @Prop({ required: true })
  userId: string; 

  @Prop({ default: 0 })
  winnerPoints: number;

  @Prop({ default: 0 })
  loserPoints: number;

  @Prop({ default: "" })
  winnerTeam: string;

  @Prop({ default: "" })
  loserTeam: string;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({
    type: {
      winner: [{ type: Number }],
      loser: [{ type: Number }],
    },
    default: { winner: [0, 0, 0, 0], loser: [0, 0, 0, 0] },
  })
  quarterScores: {
    winner: number[];
    loser: number[];
  };
}

export const MatchSchema = SchemaFactory.createForClass(Match);