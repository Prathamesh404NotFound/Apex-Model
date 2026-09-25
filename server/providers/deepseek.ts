import { OpenAICompatibleProvider } from './openai-compatible.js';

export class DeepSeekProvider extends OpenAICompatibleProvider {
  constructor() {
    super({
      id: 'deepseek',
      name: 'DeepSeek',
      defaultBaseUrl: 'https://api.deepseek.com/v1',
      apiKeyEnvVar: 'DEEPSEEK_API_KEY',
      defaultModels: [
        {
          id: 'deepseek-chat',
          provider: 'DeepSeek',
          providerModelId: 'deepseek-chat',
          displayName: 'DeepSeek-V3',
          version: 'V3',
          status: 'Available',
          modalities: ['Text', 'Code'],
          contextWindow: 65536,
          reasoning: true,
          coding: true,
          vision: false,
          tools: true,
          localAvailable: false,
          license: 'Commercial API / Open-Weights',
          documentationUrl: 'https://api-docs.deepseek.com',
          modelCardUrl: 'https://github.com/deepseek-ai/DeepSeek-V3',
          lastVerifiedAt: new Date().toISOString(),
        },
        {
          id: 'deepseek-reasoner',
          provider: 'DeepSeek',
          providerModelId: 'deepseek-reasoner',
          displayName: 'DeepSeek-R1 (Reasoner)',
          version: 'R1',
          status: 'Available',
          modalities: ['Text', 'Code'],
          contextWindow: 65536,
          reasoning: true,
          coding: true,
          vision: false,
          tools: true,
          localAvailable: false,
          license: 'Commercial API / MIT Weights',
          documentationUrl: 'https://api-docs.deepseek.com/guides/reasoning_model',
          modelCardUrl: 'https://github.com/deepseek-ai/DeepSeek-R1',
          lastVerifiedAt: new Date().toISOString(),
        },
      ],
    });
  }
}
