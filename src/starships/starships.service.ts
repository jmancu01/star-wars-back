// starships.service.ts
import { Injectable } from '@nestjs/common';
import { SwapiService } from '../shared/swapi.service';
import { SwapiResponse, Starship } from '../shared/types';

@Injectable()
export class StarshipsService {
  constructor(private readonly swapiService: SwapiService) {}

  async getAllStarships(page?: number): Promise<SwapiResponse<Starship>> {
    const params = page ? { page } : {};
    const res = this.swapiService.getAllStarships(params);
    return res;
  }

  async searchStarships(
    searchTerm: string,
    page?: number,
  ): Promise<SwapiResponse<Starship>> {
    return this.swapiService.searchStarships(searchTerm, page);
  }

  async getStarshipById(id: string): Promise<Starship> {
    return this.swapiService.getStarshipById(id);
  }
}
