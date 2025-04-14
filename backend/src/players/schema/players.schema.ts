import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlayerDocument = Player & Document;

@Schema()
export class Player {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  number: number;

  @Prop({ required: false })
  height: number;

  @Prop({ required: false })
  weight: number;

  @Prop({ required: true })
  position: string;

  @Prop({ required: false })
  nationality: string;

  @Prop({ required: false })
  age: number;

  @Prop({ required: false })
  player_photo: string;

  @Prop({ required: true })
  team_id: string;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);