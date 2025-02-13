// src/characters/characters.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { SwapiService } from '../shared/swapi.service';
import { OpenAIService } from 'src/shared/openai.service';

@Module({
  imports: [HttpModule],
  controllers: [CharactersController],
  providers: [CharactersService, SwapiService, OpenAIService],
})
export class CharactersModule {}
