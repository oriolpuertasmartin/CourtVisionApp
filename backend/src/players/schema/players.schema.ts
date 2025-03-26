import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlayerDocument = Player & Document;

@Schema()
export class Player {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  number: number;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  weight: number;

  @Prop({ required: true })
  position: string;

  @Prop({ required: true })
  nationality: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true })
  player_photo: string;

  @Prop({ required: true })
  team_id: string;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);