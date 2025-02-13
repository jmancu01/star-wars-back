// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CharactersModule } from './characters/characters.module';
import { FilmsModule } from './films/films.module';
import { StarshipsModule } from './starships/starships.module';
import { PlanetsModule } from './planets/planets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    CharactersModule,
    FilmsModule,
    StarshipsModule,
    PlanetsModule,
  ],
})
export class AppModule {}
