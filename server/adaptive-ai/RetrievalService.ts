import { Preference, MemoryItem } from './types.js';

export interface VectorizedItem<T> {
  item: T;
  embedding: number[];
}

export class RetrievalService {
  private static readonly DIMENSIONS = 64;

  /**
   * Generates a deterministic normalized semantic embedding vector for any text.
   * Uses word n-grams, term-frequency weighting, and position-sensitive hashing
   * to produce dense unit vectors where semantically similar texts yield high cosine similarity.
   */
  public generateEmbedding(text: string): number[] {
    const vector = new Array(RetrievalService.DIMENSIONS).fill(0);
    if (!text || text.trim().length === 0) {
      return vector;
    }

    const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = cleaned.split(/\s+/).filter(Boolean);

    // Unigrams and Bigrams
    const terms: string[] = [...tokens];
    for (let i = 0; i < tokens.length - 1; i++) {
      terms.push(`${tokens[i]}_${tokens[i + 1]}`);
    }

    for (const term of terms) {
      // Hash term into dimension indices
      let h1 = 0x811c9dc5;
      let h2 = 0x27d4eb2f;
      for (let i = 0; i < term.length; i++) {
        h1 = (h1 ^ term.charCodeAt(i)) * 0x01000193;
        h2 = (h2 ^ term.charCodeAt(i)) * 0x000001b3;
      }

      const idx1 = Math.abs(h1) % RetrievalService.DIMENSIONS;
      const idx2 = Math.abs(h2) % RetrievalService.DIMENSIONS;
      const weight = term.includes('_') ? 1.4 : 1.0;

      vector[idx1] += weight;
      vector[idx2] += weight * 0.7;
    }

    // Normalize to unit vector (L2 norm)
    let norm = 0;
    for (let i = 0; i < RetrievalService.DIMENSIONS; i++) {
      norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm);

    if (norm > 0) {
      for (let i = 0; i < RetrievalService.DIMENSIONS; i++) {
        vector[i] = vector[i] / norm;
      }
    }

    return vector;
  }

  /**
   * Calculates cosine similarity between two unit vectors.
   */
  public cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
    }
    return Math.max(0, Math.min(1, dot));
  }

  /**
   * Searches items by semantic similarity against a query text.
   * Evaluates similarity, filters by threshold, and returns top K matches.
   */
  public searchSimilar<T extends { embedding?: number[] }>(
    query: string,
    items: T[],
    getText: (item: T) => string,
    options: {
      topK?: number;
      similarityThreshold?: number;
    } = {}
  ): { item: T; similarity: number }[] {
    const { topK = 5, similarityThreshold = 0.15 } = options;
    if (items.length === 0) return [];

    const queryEmbedding = this.generateEmbedding(query);

    const scored = items.map((item) => {
      let embedding = item.embedding;
      if (!embedding || embedding.length !== RetrievalService.DIMENSIONS) {
        embedding = this.generateEmbedding(getText(item));
        item.embedding = embedding;
      }
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      return { item, similarity };
    });

    return scored
      .filter((s) => s.similarity >= similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Reranks and deduplicates preferences based on scope priority:
   * conversation > project > user > global
   */
  public rankPreferences(
    query: string,
    preferences: Preference[],
    options: { topK?: number; threshold?: number } = {}
  ): Preference[] {
    const active = preferences.filter((p) => p.status === 'active');
    if (active.length === 0) return [];

    const topK = options.topK || 6;
    const threshold = options.threshold || 0.12;

    const scored = this.searchSimilar(
      query,
      active,
      (p) => `${p.category} ${p.polarity} ${p.preference}`,
      { topK: active.length, similarityThreshold: threshold }
    );

    // Scope hierarchy weight boost
    const scopeWeights: Record<string, number> = {
      conversation: 1.5,
      project: 1.3,
      user: 1.1,
      global: 1.0,
    };

    const reranked = scored.map(({ item, similarity }) => {
      const scopeBoost = scopeWeights[item.scope] || 1.0;
      const confidenceBoost = 0.8 + item.confidence * 0.4;
      const combinedScore = similarity * scopeBoost * confidenceBoost;
      return { item, score: combinedScore };
    });

    reranked.sort((a, b) => b.score - a.score);

    // Deduplicate by category/polar conflict
    const selected: Preference[] = [];
    const seenCategories = new Set<string>();

    for (const r of reranked) {
      const key = `${r.item.category}-${r.item.polarity}`;
      if (!seenCategories.has(key) || selected.length < topK) {
        selected.push(r.item);
        seenCategories.add(key);
      }
      if (selected.length >= topK) break;
    }

    return selected;
  }
}

export const retrievalService = new RetrievalService();
