// planets.service.ts
import { Injectable } from '@nestjs/common';
import { SwapiService } from '../shared/swapi.service';
import { SwapiResponse, Planet } from '../shared/types';

@Injectable()
export class PlanetsService {
  constructor(private readonly swapiService: SwapiService) {}

  async getAllPlanets(page?: number): Promise<SwapiResponse<Planet>> {
    const params = page ? { page } : {};
    const res = this.swapiService.getAllPlanets(params);
    return res;
  }

  async searchPlanets(
    searchTerm: string,
    page?: number,
  ): Promise<SwapiResponse<Planet>> {
    return this.swapiService.searchPlanets(searchTerm, page);
  }

  async getPlanetById(id: string): Promise<Planet> {
    return this.swapiService.getPlanetById(id);
  }
}
