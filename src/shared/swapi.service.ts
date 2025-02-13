// swapi.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SwapiResponse, Character, Film, Starship, Planet } from './types';
import { AxiosResponse, AxiosError } from 'axios';

interface QueryParams {
  page?: number;
  search?: string;
  [key: string]: string | number | undefined;
}

@Injectable()
export class SwapiService {
  private readonly baseUrl = 'https://swapi.dev/api';
  private readonly logger = new Logger(SwapiService.name);

  constructor(private readonly httpService: HttpService) {}

  private buildQueryString(params: QueryParams): string {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return queryParams.toString();
  }

  async get<T>(
    endpoint: string,
    params: QueryParams = {},
  ): Promise<SwapiResponse<T>> {
    try {
      const queryString = this.buildQueryString(params);
      const url = `${this.baseUrl}/${endpoint}${
        queryString ? `?${queryString}` : ''
      }`;

      this.logger.debug(`Fetching: ${url}`);

      const { data } = await firstValueFrom<AxiosResponse<SwapiResponse<T>>>(
        this.httpService.get(url),
      );

      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(`Error fetching ${endpoint}: ${axiosError.message}`);
      throw error;
    }
  }

  async getById<T>(endpoint: string, id: string): Promise<T> {
    try {
      const url = `${this.baseUrl}/${endpoint}/${id}`;
      const { data } = await firstValueFrom<AxiosResponse<T>>(
        this.httpService.get(url),
      );
      return {
        ...data,
        id,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Error fetching ${endpoint}/${id}: ${axiosError.message}`,
      );
      throw error;
    }
  }
  // Characters endpoints
  async getAllCharacters(
    params: QueryParams = {},
  ): Promise<SwapiResponse<Character>> {
    return this.get<Character>('people', params);
  }

  async searchCharacters(
    searchTerm: string,
    page?: number,
  ): Promise<SwapiResponse<Character>> {
    return this.get<Character>('people', { search: searchTerm, page });
  }

  async getCharacterById(id: string): Promise<Character> {
    return this.getById<Character>('people', id);
  }

  // Films
  async getAllFilms(params: QueryParams = {}) {
    return this.get<Film>('films', params);
  }

  async searchFilms(searchTerm: string, page?: number) {
    return this.get<Film>('films', { search: searchTerm, page });
  }

  async getFilmById(id: string) {
    return this.getById<Film>('films', id);
  }

  // Starships
  async getAllStarships(params: QueryParams = {}) {
    return this.get<Starship>('starships', params);
  }

  async searchStarships(searchTerm: string, page?: number) {
    return this.get<Starship>('starships', { search: searchTerm, page });
  }

  async getStarshipById(id: string) {
    return this.getById<Starship>('starships', id);
  }

  // Planets
  async getAllPlanets(params: QueryParams = {}) {
    return this.get<Planet>('planets', params);
  }

  async searchPlanets(searchTerm: string, page?: number) {
    return this.get<Planet>('planets', { search: searchTerm, page });
  }

  async getPlanetById(id: string) {
    return this.getById<Planet>('planets', id);
  }
}
