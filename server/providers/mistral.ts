import { OpenAICompatibleProvider } from './openai-compatible.js';

export class MistralProvider extends OpenAICompatibleProvider {
  constructor() {
    super({
      id: 'mistral',
      name: 'Mistral AI',
      defaultBaseUrl: 'https://api.mistral.ai/v1',
      apiKeyEnvVar: 'MISTRAL_API_KEY',
      defaultModels: [
        {
          id: 'mistral-large-latest',
          provider: 'Mistral AI',
          providerModelId: 'mistral-large-latest',
          displayName: 'Mistral Large 2',
          version: '2',
          status: 'Available',
          modalities: ['Text', 'Code'],
          contextWindow: 128000,
          reasoning: true,
          coding: true,
          vision: false,
          tools: true,
          localAvailable: false,
          license: 'Proprietary Cloud API',
          documentationUrl: 'https://docs.mistral.ai',
          modelCardUrl: 'https://mistral.ai/technology/',
          lastVerifiedAt: new Date().toISOString(),
        },
        {
          id: 'codestral-latest',
          provider: 'Mistral AI',
          providerModelId: 'codestral-latest',
          displayName: 'Codestral',
          version: 'latest',
          status: 'Available',
          modalities: ['Code', 'Text'],
          contextWindow: 256000,
          reasoning: true,
          coding: true,
          vision: false,
          tools: true,
          localAvailable: false,
          license: 'Mistral Non-Production / Commercial API',
          documentationUrl: 'https://docs.mistral.ai/capabilities/code_generation/',
          modelCardUrl: 'https://mistral.ai/news/codestral/',
          lastVerifiedAt: new Date().toISOString(),
        },
      ],
    });
  }
}
