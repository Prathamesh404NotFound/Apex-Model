import { OpenAICompatibleProvider } from './openai-compatible.js';

export class XAIProvider extends OpenAICompatibleProvider {
  constructor() {
    super({
      id: 'xai',
      name: 'xAI Grok',
      defaultBaseUrl: 'https://api.x.ai/v1',
      apiKeyEnvVar: 'XAI_API_KEY',
      defaultModels: [
        {
          id: 'grok-4.20',
          provider: 'xAI Grok',
          providerModelId: 'grok-4.20',
          displayName: 'Grok 4.20 (Reasoning)',
          version: '4.20',
          status: 'Available',
          modalities: ['Text', 'Code'],
          contextWindow: 131072,
          reasoning: true,
          coding: true,
          vision: false,
          tools: true,
          localAvailable: false,
          license: 'Proprietary Cloud API',
          documentationUrl: 'https://docs.x.ai',
          modelCardUrl: 'https://x.ai',
          lastVerifiedAt: new Date().toISOString(),
        },
        {
          id: 'grok-2-latest',
          provider: 'xAI Grok',
          providerModelId: 'grok-2-latest',
          displayName: 'Grok 2',
          version: '2',
          status: 'Available',
          modalities: ['Text', 'Code', 'Vision'],
          contextWindow: 131072,
          reasoning: true,
          coding: true,
          vision: true,
          tools: true,
          localAvailable: false,
          license: 'Proprietary Cloud API',
          documentationUrl: 'https://docs.x.ai',
          modelCardUrl: 'https://x.ai',
          lastVerifiedAt: new Date().toISOString(),
        },
      ],
    });
  }
}
