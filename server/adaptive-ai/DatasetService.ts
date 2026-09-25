import { DatasetCandidate, TrainingDataset, DatasetType } from './types.js';

export class DatasetService {
  private candidates: Map<string, DatasetCandidate> = new Map();
  private datasets: Map<string, TrainingDataset> = new Map();

  constructor() {
    this.seedInitialCandidatesAndDatasets();
  }

  private seedInitialCandidatesAndDatasets() {
    const seedCandidates: DatasetCandidate[] = [
      {
        id: 'cand-1',
        type: 'DPO',
        prompt: 'Explain the difference between useEffect and useLayoutEffect in React.',
        chosen: '`useEffect` runs asynchronously after the browser paints the screen, making it ideal for data fetching and subscriptions. `useLayoutEffect` runs synchronously immediately after DOM mutations but before browser paint, designed strictly for measuring DOM nodes or preventing layout flickers.',
        rejected: 'Sure, I would be pleased to answer your question! In React, both hooks are very important. As an AI assistant, I recommend learning both...',
        margin: 0.42,
        category: 'Conciseness & Precision',
        sourceModel: 'gpt-5-turbo',
        qualityScore: 0.96,
        verified: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'cand-2',
        type: 'DPO',
        prompt: 'Write a TypeScript function to debounce an event handler.',
        chosen: '```typescript\nexport function debounce<T extends (...args: any[]) => void>(\n  fn: T,\n  delayMs: number\n): (...args: Parameters<T>) => void {\n  let timer: ReturnType<typeof setTimeout> | undefined;\n  return (...args: Parameters<T>) => {\n    if (timer) clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delayMs);\n  };\n}\n```',
        rejected: '```javascript\nfunction debounce(fn, d) {\n  var t;\n  return function() {\n    clearTimeout(t);\n    t = setTimeout(fn, d);\n  }\n}\n```\nHere is a simple javascript function that might work for you.',
        margin: 0.58,
        category: 'TypeScript Standards',
        sourceModel: 'gemini-3.1-pro-preview',
        qualityScore: 0.98,
        verified: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'cand-3',
        type: 'SFT',
        prompt: 'How to design a modern card in Tailwind CSS without heavy gradients?',
        output: 'Use a crisp white background with a subtle border and micro-shadow:\n\n```html\n<div class="bg-white border border-[#E7E9EE] rounded-2xl p-6 shadow-2xs hover:border-gray-300 transition-colors">\n  <h3 class="text-sm font-semibold text-gray-900">Card Title</h3>\n  <p class="text-xs text-gray-500 mt-1 leading-relaxed">Clean editorial aesthetic with intentional whitespace.</p>\n</div>\n```',
        category: 'UI Aesthetics',
        sourceModel: 'claude-3-7-sonnet',
        qualityScore: 0.95,
        verified: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'cand-4',
        type: 'KTO',
        prompt: 'Generate an Express proxy endpoint that forwards Bearer tokens to an AI backend.',
        output: '```typescript\napp.post("/api/ai/proxy", async (req, res) => {\n  const token = req.headers.authorization;\n  const response = await fetch("https://api.provider.com/v1/chat", {\n    method: "POST",\n    headers: { "Content-Type": "application/json", Authorization: token || "" },\n    body: JSON.stringify(req.body)\n  });\n  res.status(response.status).json(await response.json());\n});\n```',
        label: 'desirable',
        category: 'Backend Security',
        sourceModel: 'gemini-3.1-pro-preview',
        qualityScore: 0.92,
        verified: true,
        createdAt: new Date().toISOString(),
      },
    ];

    for (const c of seedCandidates) {
      this.candidates.set(c.id, c);
    }

    // Seed initial dataset
    const dpoDataset: TrainingDataset = {
      id: 'ds-dpo-curated-v1',
      name: 'Human Preference Alignment (DPO-v1)',
      description: 'Curated pairwise preference pairs optimized for direct explanations, TypeScript rigor, and minimal UI aesthetic.',
      type: 'DPO',
      itemCount: seedCandidates.filter((c) => c.type === 'DPO').length,
      items: seedCandidates.filter((c) => c.type === 'DPO'),
      format: 'huggingface',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sftDataset: TrainingDataset = {
      id: 'ds-sft-curated-v1',
      name: 'Concise Technical Instructions (SFT-v1)',
      description: 'Supervised instruction dataset for rigorous technical responses without conversational filler.',
      type: 'SFT',
      itemCount: seedCandidates.filter((c) => c.type === 'SFT').length,
      items: seedCandidates.filter((c) => c.type === 'SFT'),
      format: 'jsonl',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.datasets.set(dpoDataset.id, dpoDataset);
    this.datasets.set(sftDataset.id, sftDataset);
  }

  public getCandidates(filterType?: DatasetType): DatasetCandidate[] {
    const all = Array.from(this.candidates.values());
    if (filterType) {
      return all.filter((c) => c.type === filterType);
    }
    return all;
  }

  public addCandidate(candidate: DatasetCandidate): void {
    this.candidates.set(candidate.id, candidate);
  }

  public getDatasets(): TrainingDataset[] {
    return Array.from(this.datasets.values());
  }

  public getDatasetById(id: string): TrainingDataset | undefined {
    return this.datasets.get(id);
  }

  public createDataset(params: {
    name: string;
    description: string;
    type: DatasetType;
    format?: TrainingDataset['format'];
    candidateIds?: string[];
  }): TrainingDataset {
    const id = `ds-${params.type.toLowerCase()}-${Date.now().toString(36)}`;
    const allCandidates = this.getCandidates(params.type);
    const selectedItems = params.candidateIds
      ? allCandidates.filter((c) => params.candidateIds?.includes(c.id))
      : allCandidates;

    const dataset: TrainingDataset = {
      id,
      name: params.name,
      description: params.description,
      type: params.type,
      itemCount: selectedItems.length,
      items: selectedItems,
      format: params.format || 'jsonl',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.datasets.set(id, dataset);
    return dataset;
  }

  /**
   * Serializes a dataset to target formats:
   * - 'jsonl': Standard line-delimited JSON
   * - 'alpaca': [{ instruction, input, output }]
   * - 'openai': JSONL with { messages: [{ role: 'system' | 'user' | 'assistant', content }] }
   * - 'huggingface': { prompt, chosen, rejected } or { instruction, response }
   */
  public exportDataset(datasetId: string, format?: TrainingDataset['format']): string {
    const dataset = this.datasets.get(datasetId);
    if (!dataset) {
      throw new Error(`Dataset ${datasetId} not found`);
    }

    const targetFormat = format || dataset.format;

    if (dataset.type === 'DPO') {
      if (targetFormat === 'huggingface') {
        const lines = dataset.items.map((it) =>
          JSON.stringify({
            prompt: it.prompt,
            chosen: it.chosen || '',
            rejected: it.rejected || '',
            margin: it.margin || 0.1,
          })
        );
        return lines.join('\n');
      }
      // Standard JSONL
      return dataset.items.map((it) => JSON.stringify(it)).join('\n');
    }

    if (dataset.type === 'SFT') {
      if (targetFormat === 'alpaca') {
        const records = dataset.items.map((it) => ({
          instruction: it.prompt,
          input: '',
          output: it.output || it.chosen || '',
        }));
        return JSON.stringify(records, null, 2);
      }

      if (targetFormat === 'openai') {
        const lines = dataset.items.map((it) =>
          JSON.stringify({
            messages: [
              { role: 'user', content: it.prompt },
              { role: 'assistant', content: it.output || it.chosen || '' },
            ],
          })
        );
        return lines.join('\n');
      }
    }

    // Default JSONL output
    return dataset.items.map((it) => JSON.stringify(it)).join('\n');
  }
}

export const datasetService = new DatasetService();
