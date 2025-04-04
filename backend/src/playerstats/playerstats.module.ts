import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayerstatsController } from './playerstats.controller';
import { PlayerstatsService } from './playerstats.service';
import { PlayerStats, PlayerStatsSchema } from './schema/playerstats.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PlayerStats.name, schema: PlayerStatsSchema }]),
  ],
  controllers: [PlayerstatsController],
  providers: [PlayerstatsService],
  exports: [PlayerstatsService], // Exportar el servicio si es necesario en otros módulos
})
export class PlayerstatsModule {}