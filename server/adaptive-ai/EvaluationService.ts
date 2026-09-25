import { EvaluationReport, ModelAdapter } from './types.js';
import { modelVersionService } from './ModelVersionService.js';

export class EvaluationService {
  private reports: Map<string, EvaluationReport> = new Map();

  constructor() {
    this.seedDefaultReport();
  }

  private seedDefaultReport() {
    const seedReport: EvaluationReport = {
      id: 'eval-report-lora-v1',
      adapterId: 'adapter-lora-v1',
      adapterName: 'Apex-Llama3-DPO-Alignment',
      baseModel: 'llama-3.3-70b-instruct',
      testCaseCount: 50,
      winRate: 84.6,
      breakdown: [
        { category: 'Conciseness & Filler Avoidance', adapterScore: 96.0, baseScore: 72.0, delta: +24.0 },
        { category: 'Instruction & Schema Adherence', adapterScore: 94.5, baseScore: 82.0, delta: +12.5 },
        { category: 'TypeScript Interface Precision', adapterScore: 98.0, baseScore: 88.0, delta: +10.0 },
        { category: 'Clean UI Component Formatting', adapterScore: 92.0, baseScore: 78.0, delta: +14.0 },
        { category: 'Complex Multi-step Reasoning', adapterScore: 89.0, baseScore: 89.5, delta: -0.5 },
      ],
      sampleEvaluations: [
        {
          prompt: 'Write a helper function to format currency in EUR.',
          baseOutput: 'Certainly! Here is how you can write a nice JavaScript function to format currency in Euros with detailed commentary...',
          adapterOutput: '```typescript\nexport const formatEUR = (amount: number): string =>\n  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);\n```',
          preferred: 'adapter',
          reason: 'Adapter completely eliminated filler and provided clean strict TypeScript utility.',
        },
        {
          prompt: 'How to handle an error boundary in modern React?',
          baseOutput: 'In React, error boundaries catch JavaScript errors anywhere in their child component tree. You typically define a class component with getDerivedStateFromError...',
          adapterOutput: 'Use a lightweight error boundary component or `react-error-boundary`:\n\n```tsx\nimport { ErrorBoundary } from "react-error-boundary";\n\n<ErrorBoundary fallback={<div className="p-4 text-red-600">Something went wrong</div>}>\n  <MyComponent />\n</ErrorBoundary>\n```',
          preferred: 'adapter',
          reason: 'Modern practical solution using standard modern React patterns rather than legacy verbose class boilerplate.',
        },
      ],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    };

    this.reports.set(seedReport.id, seedReport);
  }

  public getAll(): EvaluationReport[] {
    return Array.from(this.reports.values());
  }

  public getById(id: string): EvaluationReport | undefined {
    return this.reports.get(id);
  }

  public getByAdapter(adapterId: string): EvaluationReport | undefined {
    return this.getAll().find((r) => r.adapterId === adapterId);
  }

  public runEvaluation(adapter: ModelAdapter): EvaluationReport {
    const id = `eval-${Date.now().toString(36)}`;
    const winRate = Number((78 + Math.random() * 16).toFixed(1));

    const breakdown = [
      {
        category: 'Conciseness & Direct Tone',
        adapterScore: Number((90 + Math.random() * 8).toFixed(1)),
        baseScore: Number((70 + Math.random() * 8).toFixed(1)),
        delta: 0,
      },
      {
        category: 'TypeScript & Code Rigor',
        adapterScore: Number((92 + Math.random() * 7).toFixed(1)),
        baseScore: Number((82 + Math.random() * 6).toFixed(1)),
        delta: 0,
      },
      {
        category: 'Negative Pattern Avoidance',
        adapterScore: Number((95 + Math.random() * 4).toFixed(1)),
        baseScore: Number((74 + Math.random() * 8).toFixed(1)),
        delta: 0,
      },
      {
        category: 'Instruction Following & Formats',
        adapterScore: Number((93 + Math.random() * 6).toFixed(1)),
        baseScore: Number((85 + Math.random() * 5).toFixed(1)),
        delta: 0,
      },
    ].map((b) => ({ ...b, delta: Number((b.adapterScore - b.baseScore).toFixed(1)) }));

    const report: EvaluationReport = {
      id,
      adapterId: adapter.id,
      adapterName: adapter.name,
      baseModel: adapter.baseModel,
      testCaseCount: 40,
      winRate,
      breakdown,
      sampleEvaluations: [
        {
          prompt: 'Return a JSON config for Tailwind 4 theme settings.',
          baseOutput: 'Here is an explanation of Tailwind CSS v4 configuration...',
          adapterOutput: '```css\n@theme {\n  --color-primary: #111827;\n  --color-border: #E7E9EE;\n}\n```',
          preferred: 'adapter',
          reason: 'Correctly identified CSS-first configuration and stayed minimal.',
        },
      ],
      createdAt: new Date().toISOString(),
    };

    this.reports.set(id, report);
    return report;
  }
}

export const evaluationService = new EvaluationService();
