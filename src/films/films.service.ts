// films.service.ts
import { Injectable } from '@nestjs/common';
import { SwapiService } from '../shared/swapi.service';
import { SwapiResponse, Film } from '../shared/types';

@Injectable()
export class FilmsService {
  constructor(private readonly swapiService: SwapiService) {}

  async getAllFilms(page?: number): Promise<SwapiResponse<Film>> {
    const params = page ? { page } : {};
    const res = this.swapiService.getAllFilms(params);
    return res;
  }

  async searchFilms(
    searchTerm: string,
    page?: number,
  ): Promise<SwapiResponse<Film>> {
    return this.swapiService.searchFilms(searchTerm, page);
  }

  async getFilmById(id: string): Promise<Film> {
    return this.swapiService.getFilmById(id);
  }
}
