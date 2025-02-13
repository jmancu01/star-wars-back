// planets.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlanetsController } from './planets.controller';
import { PlanetsService } from './planets.service';
import { SwapiService } from '../shared/swapi.service';

@Module({
  imports: [HttpModule],
  controllers: [PlanetsController],
  providers: [PlanetsService, SwapiService],
})
export class PlanetsModule {}
