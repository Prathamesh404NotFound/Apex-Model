import { OpenAICompatibleProvider } from './openai-compatible.js';

export class OpenRouterProvider extends OpenAICompatibleProvider {
  constructor() {
    super({
      id: 'openrouter',
      name: 'OpenRouter',
      defaultBaseUrl: 'https://openrouter.ai/api/v1',
      apiKeyEnvVar: 'OPENROUTER_API_KEY',
      defaultModels: [
        {
          id: 'openrouter/auto',
          provider: 'OpenRouter',
          providerModelId: 'openrouter/auto',
          displayName: 'OpenRouter Auto Router',
          version: 'auto',
          status: 'Available',
          modalities: ['Text', 'Code'],
          contextWindow: 128000,
          reasoning: true,
          coding: true,
          vision: true,
          tools: true,
          localAvailable: false,
          license: 'Router Gateway',
          documentationUrl: 'https://openrouter.ai/docs',
          modelCardUrl: 'https://openrouter.ai',
          lastVerifiedAt: new Date().toISOString(),
        },
      ],
    });
  }
}
