import { Module } from '@nestjs/common';
import { PlayerstatsController } from './playerstats.controller';
import { PlayerstatsService } from './playerstats.service';

@Module({
  controllers: [PlayerstatsController],
  providers: [PlayerstatsService]
})
export class PlayerstatsModule {}
