// starships.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { StarshipsService } from './starships.service';
import { PaginatedResponse, Starship, SwapiResponse } from '../shared/types';

interface StarshipQueryDto {
  page?: string;
  limit?: string;
  search?: string;
  name?: string;
  model?: string;
  manufacturer?: string;
  starship_class?: string;
  hyperdrive_rating?: string;
  crew?: string;
}

@Controller('starships')
export class StarshipsController {
  constructor(private readonly starshipsService: StarshipsService) {}

  private async fetchStarshipsRecursively(
    filters: Partial<StarshipQueryDto>,
    targetCount: number,
    currentPage = 1,
    accumulatedResults: Starship[] = [],
    totalPages?: number,
  ): Promise<Starship[]> {
    if (
      accumulatedResults.length >= targetCount ||
      (totalPages && currentPage > totalPages)
    ) {
      return accumulatedResults;
    }

    try {
      const response: SwapiResponse<Starship> = filters.search
        ? await this.starshipsService.searchStarships(
            filters.search,
            currentPage,
          )
        : await this.starshipsService.getAllStarships(currentPage);

      if (!totalPages) {
        totalPages = Math.ceil(response.count / 10);
      }

      if (!response.results || response.results.length === 0) {
        return accumulatedResults;
      }

      const filterCriteria: Partial<
        Omit<StarshipQueryDto, 'search' | 'page' | 'limit'>
      > = Object.entries(filters)
        .filter(([key]) => key !== 'search')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const filteredResults = response.results.filter((starship) => {
        return Object.entries(filterCriteria).every(([key, value]) => {
          if (!value) return true;

          const starshipValue = starship[key as keyof Starship];
          if (starshipValue === undefined || starshipValue === null) {
            return false;
          }
          const startShipParsed = starshipValue.toString().toLowerCase();
          const valueParsed = value.toString().toLowerCase();
          return startShipParsed.includes(valueParsed);
        });
      });

      const newResults = [...accumulatedResults, ...filteredResults];

      if (
        newResults.length < targetCount &&
        currentPage < totalPages &&
        response.next
      ) {
        return this.fetchStarshipsRecursively(
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
        console.error('Error in fetchStarshipsRecursively:', error.message);
      } else {
        console.error('Unknown error in fetchStarshipsRecursively');
      }
      return accumulatedResults;
    }
  }

  @Get()
  async getAllStarships(
    @Query() query: StarshipQueryDto,
  ): Promise<PaginatedResponse<Starship>> {
    const { page = '1', limit = '10', ...filters } = query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const targetCount = limitNumber * pageNumber;

    const starships = await this.fetchStarshipsRecursively(
      filters,
      targetCount,
    );

    const total = starships.length;
    const totalPages = Math.ceil(total / limitNumber);
    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = startIndex + limitNumber;
    const paginatedData = starships.slice(startIndex, endIndex);

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
  getStarshipById(@Param('id') id: string) {
    return this.starshipsService.getStarshipById(id);
  }
}
