// test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CharactersModule } from '../src/characters/characters.module';
import { FilmsModule } from '../src/films/films.module';
import { StarshipsModule } from '../src/starships/starships.module';
import { PlanetsModule } from '../src/planets/planets.module';
import { HttpModule } from '@nestjs/axios';
import {
  Character,
  Film,
  PaginatedResponse,
  Planet,
  Starship,
} from 'src/shared/types';
import type { Server } from 'http';

describe('Star Wars API (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        CharactersModule,
        FilmsModule,
        StarshipsModule,
        PlanetsModule,
        HttpModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Characters Module', () => {
    it('/characters (GET)', () => {
      return request(httpServer)
        .get('/characters')
        .expect(200)
        .expect((res) => {
          const response = res.body as PaginatedResponse<Character>;
          expect(response).toHaveProperty('data');
          expect(response).toHaveProperty('meta');
          expect(Array.isArray(response.data)).toBe(true);
        });
    });

    it('/characters?search=luke (GET)', () => {
      return request(httpServer)
        .get('/characters?search=luke')
        .expect(200)
        .expect((res) => {
          const response = res.body as PaginatedResponse<Character>;
          expect(
            response.data.some((char) =>
              char.name.toLowerCase().includes('luke'),
            ),
          ).toBe(true);
        });
    });

    it('/characters/1 (GET)', () => {
      return request(httpServer)
        .get('/characters/1')
        .expect(200)
        .expect((res) => {
          const character = res.body as Character;
          expect(character).toHaveProperty('name');
          expect(character).toHaveProperty('birth_year');
        });
    });
  });

  describe('Films Module', () => {
    it('/films (GET)', () => {
      return request(httpServer)
        .get('/films')
        .expect(200)
        .expect((res) => {
          const response = res.body as { data: Film[] };
          expect(Array.isArray(response.data)).toBe(true);
        });
    });

    it('/films/1 (GET)', () => {
      return request(httpServer)
        .get('/films/1')
        .expect(200)
        .expect((res) => {
          const film = res.body as Film;
          expect(film).toHaveProperty('title');
          expect(film).toHaveProperty('episode_id');
        });
    });
  });

  describe('Starships Module', () => {
    it('/starships (GET)', () => {
      return request(httpServer)
        .get('/starships')
        .expect(200)
        .expect((res) => {
          const response = res.body as { data: Starship[] };
          expect(Array.isArray(response.data)).toBe(true);
        });
    });

    it('/starships/9 (GET)', () => {
      return request(httpServer)
        .get('/starships/9')
        .expect(200)
        .expect((res) => {
          const starship = res.body as Starship;
          expect(starship).toHaveProperty('name');
          expect(starship).toHaveProperty('model');
        });
    });
  });

  describe('Planets Module', () => {
    it('/planets (GET)', () => {
      return request(httpServer)
        .get('/planets')
        .expect(200)
        .expect((res) => {
          const response = res.body as { data: Planet[] };
          expect(Array.isArray(response.data)).toBe(true);
        });
    });

    it('/planets/1 (GET)', () => {
      return request(httpServer)
        .get('/planets/1')
        .expect(200)
        .expect((res) => {
          const planet = res.body as Planet;
          expect(planet).toHaveProperty('name');
          expect(planet).toHaveProperty('climate');
        });
    });
  });

  describe('Cross-module Integration', () => {
    it('should fetch a character and their related film data', async () => {
      const characterResponse = await request(httpServer)
        .get('/characters/1')
        .expect(200);

      const character = characterResponse.body as Character;
      const firstFilmUrl = character.films[0];

      const filmId = firstFilmUrl.split('/').filter(Boolean).pop();

      return request(httpServer)
        .get(`/films/${filmId}`)
        .expect(200)
        .expect((res) => {
          const film = res.body as Film;
          expect(film).toHaveProperty('title');
          expect(film.characters).toContain(character.url);
        });
    });

    it('should fetch a planet and its residents', async () => {
      const planetResponse = await request(httpServer)
        .get('/planets/1')
        .expect(200);

      const planet = planetResponse.body as Planet;
      const firstResidentUrl = planet.residents[0];

      const residentId = firstResidentUrl.split('/').filter(Boolean).pop();

      return request(httpServer)
        .get(`/characters/${residentId}`)
        .expect(200)
        .expect((res) => {
          const character = res.body as Character;
          expect(character.homeworld).toBe(planet.url);
        });
    });
  });
});
