import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { MatchesModule } from './matches/matches.module';
import { PlayersModule } from './players/players.module';
import { PlayerstatsModule } from './playerstats/playerstats.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/courtvision'),
    UsersModule,
    TeamsModule,
    MatchesModule,
    PlayersModule,
    PlayerstatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
