import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { Match, MatchSchema } from './schema/matches.schema';
import { PlayerstatsModule } from '../playerstats/playerstats.module'; 

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
    PlayerstatsModule, 
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}