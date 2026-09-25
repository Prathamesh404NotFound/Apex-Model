import { Preference, PreferenceScope, PreferenceCategory, PreferencePolarity } from './types.js';

export class PreferenceService {
  private preferences: Map<string, Preference> = new Map();

  constructor() {
    this.seedDefaultPreferences();
  }

  private seedDefaultPreferences() {
    const seeds: Omit<Preference, 'createdAt' | 'updatedAt'>[] = [
      {
        id: 'pref-concise',
        userId: 'default-user',
        scope: 'user',
        category: 'verbosity',
        preference: 'Provide direct, concise answers without conversational filler or apologies',
        polarity: 'prefer',
        confidence: 0.95,
        evidenceCount: 12,
        source: 'Initial Setup & Learned Feedback',
        status: 'active',
      },
      {
        id: 'pref-ts-strict',
        userId: 'default-user',
        scope: 'project',
        category: 'coding',
        preference: 'Use strict TypeScript with explicit interfaces and zero "any" types',
        polarity: 'prefer',
        confidence: 0.92,
        evidenceCount: 9,
        source: 'Project Coding Standards',
        status: 'active',
      },
      {
        id: 'pref-no-cliches',
        userId: 'default-user',
        scope: 'user',
        category: 'writing',
        preference: 'Avoid generic AI disclaimers like "As an AI language model..." and superficial advice',
        polarity: 'avoid',
        confidence: 0.98,
        evidenceCount: 15,
        source: 'Thumbs Down Feedback',
        status: 'active',
      },
      {
        id: 'pref-structured-formatting',
        userId: 'default-user',
        scope: 'user',
        category: 'formatting',
        preference: 'Organize responses with clean markdown headings and bulleted action points',
        polarity: 'prefer',
        confidence: 0.88,
        evidenceCount: 7,
        source: 'Response Edit Pattern',
        status: 'active',
      },
      {
        id: 'pref-tailwind-clean',
        userId: 'default-user',
        scope: 'project',
        category: 'UI',
        preference: 'Prefer minimal, editorial UI styling with clean borders over heavy gradients or flashy animations',
        polarity: 'prefer',
        confidence: 0.89,
        evidenceCount: 6,
        source: 'UI Design Guideline',
        status: 'active',
      },
    ];

    const now = new Date().toISOString();
    for (const seed of seeds) {
      this.preferences.set(seed.id, {
        ...seed,
        createdAt: now,
        updatedAt: now,
        lastUsedAt: now,
      });
    }
  }

  public getAll(): Preference[] {
    return Array.from(this.preferences.values());
  }

  public getById(id: string): Preference | undefined {
    return this.preferences.get(id);
  }

  public getByScope(scope: PreferenceScope): Preference[] {
    return this.getAll().filter((p) => p.scope === scope);
  }

  public getActive(): Preference[] {
    return this.getAll().filter((p) => p.status === 'active');
  }

  public create(data: {
    userId?: string;
    projectId?: string;
    conversationId?: string;
    scope?: PreferenceScope;
    category?: PreferenceCategory;
    preference: string;
    polarity?: PreferencePolarity;
    confidence?: number;
    source?: string;
  }): Preference {
    const id = `pref-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const newPref: Preference = {
      id,
      userId: data.userId || 'default-user',
      projectId: data.projectId,
      conversationId: data.conversationId,
      scope: data.scope || 'user',
      category: data.category || 'communication',
      preference: data.preference.trim(),
      polarity: data.polarity || 'prefer',
      confidence: data.confidence ?? 0.85,
      evidenceCount: 1,
      source: data.source || 'Direct User Addition',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      lastUsedAt: now,
    };

    this.preferences.set(id, newPref);
    return newPref;
  }

  public update(id: string, updates: Partial<Preference>): Preference | undefined {
    const existing = this.preferences.get(id);
    if (!existing) return undefined;

    const updated: Preference = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.preferences.set(id, updated);
    return updated;
  }

  public delete(id: string): boolean {
    return this.preferences.delete(id);
  }

  public setStatus(id: string, status: 'active' | 'paused' | 'archived'): Preference | undefined {
    return this.update(id, { status });
  }

  /**
   * Extracts or reinforces preferences automatically from user feedback signals.
   */
  public extractFromFeedback(params: {
    userId?: string;
    projectId?: string;
    rating?: 'positive' | 'negative';
    reasons: string[];
    comment?: string;
    suggestedAlternative?: string;
    sourceModel?: string;
  }): Preference[] {
    const extracted: Preference[] = [];
    const { reasons, comment, suggestedAlternative, rating, userId = 'default-user', projectId } = params;

    for (const reason of reasons) {
      const lowerReason = reason.toLowerCase();
      let category: PreferenceCategory = 'communication';
      let polarity: PreferencePolarity = rating === 'negative' ? 'avoid' : 'prefer';

      if (lowerReason.includes('code') || lowerReason.includes('typescript') || lowerReason.includes('bug')) {
        category = 'coding';
      } else if (lowerReason.includes('verbose') || lowerReason.includes('length') || lowerReason.includes('long')) {
        category = 'verbosity';
      } else if (lowerReason.includes('visual') || lowerReason.includes('design') || lowerReason.includes('gradient')) {
        category = 'visual';
      } else if (lowerReason.includes('tone') || lowerReason.includes('robotic') || lowerReason.includes('apolog')) {
        category = 'tone';
      } else if (lowerReason.includes('instruction') || lowerReason.includes('follow')) {
        category = 'reasoning';
      }

      // Check if similar preference already exists to increment evidence
      const existing = this.getAll().find(
        (p) =>
          p.category === category &&
          p.preference.toLowerCase().includes(lowerReason.slice(0, 10))
      );

      if (existing) {
        existing.evidenceCount += 1;
        existing.confidence = Math.min(0.99, existing.confidence + 0.03);
        existing.updatedAt = new Date().toISOString();
        extracted.push(existing);
      } else {
        const prefText = rating === 'negative'
          ? `Avoid: ${reason}`
          : `Prefer: ${reason}`;
        
        const created = this.create({
          userId,
          projectId,
          scope: projectId ? 'project' : 'user',
          category,
          preference: prefText,
          polarity,
          confidence: 0.8,
          source: `User Feedback (${rating === 'negative' ? 'Negative Flag' : 'Positive Upvote'})`,
        });
        extracted.push(created);
      }
    }

    if (suggestedAlternative && suggestedAlternative.trim().length > 10) {
      const editPref = this.create({
        userId,
        projectId,
        scope: projectId ? 'project' : 'user',
        category: 'workflow',
        preference: `Match user phrasing style: "${suggestedAlternative.slice(0, 80)}..."`,
        polarity: 'prefer',
        confidence: 0.85,
        source: 'User Direct Edit / Correction',
      });
      extracted.push(editPref);
    }

    return extracted;
  }
}

export const preferenceService = new PreferenceService();
