import { Controller, Get, Query, Param, Body, Post } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { Character, PaginatedResponse, SwapiResponse } from '../shared/types';
import { Message } from 'src/shared/openai.service';

interface CharacterQueryDto {
  page?: string;
  limit?: string;
  search?: string;
  name?: string;
  gender?: string;
  birth_year?: string;
}
interface ChatMessageDto {
  message: string;
}

@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  private async fetchCharactersRecursively(
    filters: Partial<CharacterQueryDto>,
    targetCount: number,
    currentPage = 1,
    accumulatedResults: Character[] = [],
    totalPages?: number,
  ): Promise<Character[]> {
    // If we already have enough results or reached the last page, return accumulated results
    if (
      accumulatedResults.length >= targetCount ||
      (totalPages && currentPage > totalPages)
    ) {
      return accumulatedResults;
    }

    try {
      // Fetch data based on whether we have a search term or not
      const response: SwapiResponse<Character> = filters.search
        ? await this.charactersService.searchCharacters(
            filters.search,
            currentPage,
          )
        : await this.charactersService.getAllCharacters(currentPage);

      // Calculate total pages if not already set
      if (!totalPages) {
        totalPages = Math.ceil(response.count / 10); // SWAPI returns 10 results per page
      }

      // If no more results are available, return what we have
      if (!response.results || response.results.length === 0) {
        return accumulatedResults;
      }

      // Create a copy of filters without the search parameter and cast to the correct type
      const filterCriteria: Partial<
        Omit<CharacterQueryDto, 'search' | 'page' | 'limit'>
      > = Object.entries(filters)
        .filter(([key]) => key !== 'search')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      // Filter the results
      const filteredResults = response.results.filter((character) => {
        return Object.entries(filterCriteria).every(([key, value]) => {
          if (!value) return true; // Skip empty filter values

          const characterValue = character[key as keyof Character];
          if (characterValue === undefined || characterValue === null) {
            return false;
          }

          return (
            characterValue.toString().toLowerCase() ===
            value.toString().toLowerCase()
          );
        });
      });

      // Combine with previous results
      const newResults = [...accumulatedResults, ...filteredResults];

      // Continue fetching if:
      // 1. We don't have enough results
      // 2. We haven't reached the last page
      // 3. There are more pages available
      if (
        newResults.length < targetCount &&
        currentPage < totalPages &&
        response.next
      ) {
        return this.fetchCharactersRecursively(
          filters,
          targetCount,
          currentPage + 1,
          newResults,
          totalPages,
        );
      }

      return newResults;
    } catch (error: unknown) {
      // Type-safe error logging
      if (error instanceof Error) {
        console.error('Error in fetchCharactersRecursively:', error.message);
      } else {
        console.error('Unknown error in fetchCharactersRecursively');
      }
      return accumulatedResults;
    }
  }

  @Get()
  async getAllCharacters(
    @Query() query: CharacterQueryDto,
  ): Promise<PaginatedResponse<Character>> {
    const { page = '1', limit = '10', ...filters } = query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Calculate how many results we need based on page and limit
    const targetCount = limitNumber * pageNumber;

    // Fetch characters with recursive pagination and filtering
    const characters = await this.fetchCharactersRecursively(
      filters,
      targetCount,
    );

    // Calculate pagination
    const total = characters.length;
    const totalPages = Math.ceil(total / limitNumber);
    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = startIndex + limitNumber;
    const paginatedData = characters.slice(startIndex, endIndex);

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
  getCharacterById(@Param('id') id: string) {
    return this.charactersService.getCharacterById(id);
  }

  @Post(':id/chat')
  async chatWithCharacter(
    @Param('id') id: string,
    @Body() chatMessage: ChatMessageDto,
    @Body() previousMessages: { previousMessages: Message[] },
  ) {
    return this.charactersService.chatWithCharacter(
      id,
      chatMessage.message,
      previousMessages.previousMessages,
    );
  }
}
