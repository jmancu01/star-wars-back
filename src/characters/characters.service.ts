// characters.service.ts
import { Injectable } from '@nestjs/common';
import { SwapiService } from '../shared/swapi.service';
import { SwapiResponse, Character } from '../shared/types';
import { Message, OpenAIService } from '../shared/openai.service';

@Injectable()
export class CharactersService {
  constructor(
    private readonly swapiService: SwapiService,
    private readonly openAIService: OpenAIService,
  ) {}

  async getAllCharacters(page?: number): Promise<SwapiResponse<Character>> {
    const params = page ? { page } : {};
    const res = this.swapiService.getAllCharacters(params);
    return res;
  }

  async searchCharacters(
    searchTerm: string,
    page?: number,
  ): Promise<SwapiResponse<Character>> {
    return this.swapiService.searchCharacters(searchTerm, page);
  }

  async getCharacterById(id: string): Promise<Character> {
    return this.swapiService.getCharacterById(id);
  }

  async chatWithCharacter(
    characterId: string,
    message: string,
    previousMessages: Message[],
  ): Promise<{ response: string }> {
    const character = await this.getCharacterById(characterId);

    const characterContext = `
      Name: ${character.name}
      Gender: ${character.gender}
      Birth Year: ${character.birth_year}
      Height: ${character.height}cm
      Mass: ${character.mass}kg
      Hair Color: ${character.hair_color}
      Eye Color: ${character.eye_color}
      Skin Color: ${character.skin_color}
    `;

    const response = await this.openAIService.chatWithCharacter(
      characterContext,
      message,
      previousMessages,
    );
    return { response };
  }
}
