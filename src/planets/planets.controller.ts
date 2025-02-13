// planets.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { PlanetsService } from './planets.service';
import { PaginatedResponse, Planet, SwapiResponse } from '../shared/types';

interface PlanetQueryDto {
  page?: string;
  limit?: string;
  search?: string;
  name?: string;
  climate?: string;
  terrain?: string;
  population?: string;
  diameter?: string;
}

@Controller('planets')
export class PlanetsController {
  constructor(private readonly planetsService: PlanetsService) {}

  private async fetchPlanetsRecursively(
    filters: Partial<PlanetQueryDto>,
    targetCount: number,
    currentPage = 1,
    accumulatedResults: Planet[] = [],
    totalPages?: number,
  ): Promise<Planet[]> {
    if (
      accumulatedResults.length >= targetCount ||
      (totalPages && currentPage > totalPages)
    ) {
      return accumulatedResults;
    }

    try {
      const response: SwapiResponse<Planet> = filters.search
        ? await this.planetsService.searchPlanets(filters.search, currentPage)
        : await this.planetsService.getAllPlanets(currentPage);

      if (!totalPages) {
        totalPages = Math.ceil(response.count / 10);
      }

      if (!response.results || response.results.length === 0) {
        return accumulatedResults;
      }

      const filterCriteria: Partial<
        Omit<PlanetQueryDto, 'search' | 'page' | 'limit'>
      > = Object.entries(filters)
        .filter(([key]) => key !== 'search')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const filteredResults = response.results.filter((planet) => {
        return Object.entries(filterCriteria).every(([key, value]) => {
          if (!value) return true;

          const planetValue = planet[key as keyof Planet];
          if (planetValue === undefined || planetValue === null) {
            return false;
          }

          const planetString = planetValue.toString().toLowerCase();
          const searchString = value.toString().toLowerCase();

          return planetString.includes(searchString);
        });
      });

      const newResults = [...accumulatedResults, ...filteredResults];

      if (
        newResults.length < targetCount &&
        currentPage < totalPages &&
        response.next
      ) {
        return this.fetchPlanetsRecursively(
          filters,
          targetCount,
          currentPage + 1,
          newResults,
          totalPages,
        );
      }

      return newResults;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error in fetchPlanetsRecursively:', error.message);
      } else {
        console.error('Unknown error in fetchPlanetsRecursively');
      }
      return accumulatedResults;
    }
  }

  @Get()
  async getAllPlanets(
    @Query() query: PlanetQueryDto,
  ): Promise<PaginatedResponse<Planet>> {
    const { page = '1', limit = '10', ...filters } = query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const targetCount = limitNumber * pageNumber;

    const planets = await this.fetchPlanetsRecursively(filters, targetCount);

    const total = planets.length;
    const totalPages = Math.ceil(total / limitNumber);
    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = startIndex + limitNumber;
    const paginatedData = planets.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      meta: {
        total,
        currentPage: pageNumber,
        totalPages,
        limit: limitNumber,
      },
    };
  }

  @Get(':id')
  getPlanetById(@Param('id') id: string) {
    return this.planetsService.getPlanetById(id);
  }
}
