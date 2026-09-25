import { MemoryItem } from './types.js';
import { retrievalService } from './RetrievalService.js';

export class MemoryService {
  private memories: Map<string, MemoryItem> = new Map();

  constructor() {
    this.seedDefaultMemories();
  }

  private seedDefaultMemories() {
    const defaultList: Omit<MemoryItem, 'createdAt' | 'updatedAt'>[] = [
      {
        id: 'mem-1',
        userId: 'default-user',
        scope: 'user',
        title: 'Development Environment & Stack',
        content: 'User primary stack is React 19, TypeScript, Vite, Tailwind CSS with Node.js backend. Hardware is 16GB RAM laptop.',
        tags: ['environment', 'stack', 'hardware'],
        importance: 8,
        source: 'Workspace Initialization',
      },
      {
        id: 'mem-2',
        userId: 'default-user',
        scope: 'user',
        title: 'Communication Standard',
        content: 'Prefers solutions directly with code examples, concise summaries, zero boilerplate apologies or robotic filler.',
        tags: ['communication', 'tone'],
        importance: 9,
        source: 'User Instruction',
      },
      {
        id: 'mem-3',
        userId: 'default-user',
        scope: 'project',
        projectId: 'project-apex',
        title: 'Apex Project Architecture Guidelines',
        content: 'Real multi-model gateway with modular provider adapters, separate online personalization and offline adapter training.',
        tags: ['architecture', 'apex', 'rules'],
        importance: 10,
        source: 'Project Specification',
      },
      {
        id: 'mem-4',
        userId: 'default-user',
        scope: 'project',
        projectId: 'project-apex',
        title: 'UI Design Constraints',
        content: 'Light, clean, friendly, minimal aesthetic (#FFFFFF, #F7F8FA, #E7E9EE borders, Plus Jakarta Sans typography). No dark cyberpunk grids.',
        tags: ['ui', 'design', 'tailwind'],
        importance: 9,
        source: 'UI Theme Specification',
      },
    ];

    const now = new Date().toISOString();
    for (const item of defaultList) {
      const embedding = retrievalService.generateEmbedding(`${item.title} ${item.content} ${item.tags.join(' ')}`);
      this.memories.set(item.id, {
        ...item,
        createdAt: now,
        updatedAt: now,
        embedding,
      });
    }
  }

  public getAll(): MemoryItem[] {
    return Array.from(this.memories.values());
  }

  public getById(id: string): MemoryItem | undefined {
    return this.memories.get(id);
  }

  public getByProject(projectId: string): MemoryItem[] {
    return this.getAll().filter((m) => m.projectId === projectId);
  }

  public create(data: {
    userId?: string;
    projectId?: string;
    scope?: 'user' | 'project' | 'conversation';
    title: string;
    content: string;
    tags?: string[];
    importance?: number;
    source?: string;
  }): MemoryItem {
    const id = `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const tags = data.tags || [];
    const embedding = retrievalService.generateEmbedding(`${data.title} ${data.content} ${tags.join(' ')}`);

    const newMemory: MemoryItem = {
      id,
      userId: data.userId || 'default-user',
      projectId: data.projectId,
      scope: data.scope || (data.projectId ? 'project' : 'user'),
      title: data.title.trim(),
      content: data.content.trim(),
      tags,
      importance: data.importance || 7,
      source: data.source || 'Manual User Entry',
      createdAt: now,
      updatedAt: now,
      embedding,
    };

    this.memories.set(id, newMemory);
    return newMemory;
  }

  public update(id: string, updates: Partial<MemoryItem>): MemoryItem | undefined {
    const existing = this.memories.get(id);
    if (!existing) return undefined;

    const title = updates.title || existing.title;
    const content = updates.content || existing.content;
    const tags = updates.tags || existing.tags;
    const embedding = retrievalService.generateEmbedding(`${title} ${content} ${tags.join(' ')}`);

    const updated: MemoryItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      embedding,
    };

    this.memories.set(id, updated);
    return updated;
  }

  public delete(id: string): boolean {
    return this.memories.delete(id);
  }

  /**
   * Performs semantic vector search on memory items.
   */
  public search(query: string, options: { topK?: number; threshold?: number; projectId?: string } = {}): MemoryItem[] {
    const { topK = 4, threshold = 0.15, projectId } = options;
    let list = this.getAll();
    if (projectId) {
      list = list.filter((m) => m.scope === 'user' || m.projectId === projectId);
    }

    const scored = retrievalService.searchSimilar(
      query,
      list,
      (m) => `${m.title} ${m.content} ${m.tags.join(' ')}`,
      { topK, similarityThreshold: threshold }
    );

    return scored.map((s) => s.item);
  }
}

export const memoryService = new MemoryService();
