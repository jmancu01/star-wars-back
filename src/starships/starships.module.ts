// starships.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StarshipsController } from './starships.controller';
import { StarshipsService } from './starships.service';
import { SwapiService } from '../shared/swapi.service';

@Module({
  imports: [HttpModule],
  controllers: [StarshipsController],
  providers: [StarshipsService, SwapiService],
})
export class StarshipsModule {}
