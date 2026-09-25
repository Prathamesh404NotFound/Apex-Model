import { AIProvider, ChatRequest, ChatResponse, StreamChunk, ModelMetadata, ProviderStatus, ProviderUsage } from '../types.js';

export abstract class BaseProvider implements AIProvider {
  public abstract id: string;
  public abstract name: string;
  protected usage: ProviderUsage = { totalRequests: 0, totalTokens: 0, estimatedCostUsd: 0 };

  public abstract listModels(): Promise<ModelMetadata[]>;
  public abstract getModel(modelId: string): Promise<ModelMetadata | null>;
  public abstract chat(req: ChatRequest): Promise<ChatResponse>;
  public abstract streamChat(req: ChatRequest, onChunk: (chunk: StreamChunk) => void): Promise<ChatResponse>;

  public countTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  public supportsVision(): boolean {
    return true;
  }

  public supportsTools(): boolean {
    return true;
  }

  public supportsReasoning(): boolean {
    return true;
  }

  public supportsFiles(): boolean {
    return true;
  }

  public getUsage(): ProviderUsage {
    return this.usage;
  }

  public abstract getStatus(): Promise<ProviderStatus>;

  protected recordUsage(tokens: number, costEstimate: number = 0) {
    this.usage.totalRequests += 1;
    this.usage.totalTokens += tokens;
    this.usage.estimatedCostUsd += costEstimate;
  }
}
