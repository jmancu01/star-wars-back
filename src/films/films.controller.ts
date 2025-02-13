// films.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { FilmsService } from './films.service';
import { Film, PaginatedResponse, SwapiResponse } from '../shared/types';

interface FilmQueryDto {
  page?: string;
  limit?: string;
  search?: string;
  title?: string;
  director?: string;
  producer?: string;
  release_date?: string;
}

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  private async fetchFilmsRecursively(
    filters: Partial<FilmQueryDto>,
    targetCount: number,
    currentPage = 1,
    accumulatedResults: Film[] = [],
    totalPages?: number,
  ): Promise<Film[]> {
    if (
      accumulatedResults.length >= targetCount ||
      (totalPages && currentPage > totalPages)
    ) {
      return accumulatedResults;
    }

    try {
      const response: SwapiResponse<Film> = filters.search
        ? await this.filmsService.searchFilms(filters.search, currentPage)
        : await this.filmsService.getAllFilms(currentPage);

      if (!totalPages) {
        totalPages = Math.ceil(response.count / 10);
      }

      if (!response.results || response.results.length === 0) {
        return accumulatedResults;
      }

      const filterCriteria: Partial<
        Omit<FilmQueryDto, 'search' | 'page' | 'limit'>
      > = Object.entries(filters)
        .filter(([key]) => key !== 'search')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const filteredResults = response.results.filter((film) => {
        return Object.entries(filterCriteria).every(([key, value]) => {
          if (!value) return true;

          const filmValue = film[key as keyof Film];
          if (filmValue === undefined || filmValue === null) {
            return false;
          }

          return (
            filmValue.toString().toLowerCase() ===
            value.toString().toLowerCase()
          );
        });
      });

      const newResults = [...accumulatedResults, ...filteredResults];

      if (
        newResults.length < targetCount &&
        currentPage < totalPages &&
        response.next
      ) {
        return this.fetchFilmsRecursively(
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
        console.error('Error in fetchFilmsRecursively:', error.message);
      } else {
        console.error('Unknown error in fetchFilmsRecursively');
      }
      return accumulatedResults;
    }
  }

  @Get()
  async getAllFilms(
    @Query() query: FilmQueryDto,
  ): Promise<PaginatedResponse<Film>> {
    const { page = '1', limit = '10', ...filters } = query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const targetCount = limitNumber * pageNumber;

    const films = await this.fetchFilmsRecursively(filters, targetCount);

    const total = films.length;
    const totalPages = Math.ceil(total / limitNumber);
    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = startIndex + limitNumber;
    const paginatedData = films.slice(startIndex, endIndex);

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
  getFilmById(@Param('id') id: string) {
    return this.filmsService.getFilmById(id);
  }
}
