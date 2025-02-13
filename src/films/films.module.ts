// films.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { SwapiService } from '../shared/swapi.service';

@Module({
  imports: [HttpModule],
  controllers: [FilmsController],
  providers: [FilmsService, SwapiService],
})
export class FilmsModule {}
