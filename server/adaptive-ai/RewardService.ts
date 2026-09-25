import { Preference } from './types.js';

export interface RewardEvaluation {
  totalScore: number; // 0.0 to 1.0
  breakdown: {
    ruleAlignment: number;
    concisenessScore: number;
    formattingScore: number;
    negativeAvoidance: number;
  };
  matchedPreferences: string[];
  violatedPreferences: string[];
}

export class RewardService {
  /**
   * Computes a reward score evaluating how well a model response satisfies active user preferences.
   */
  public evaluateResponse(
    text: string,
    prompt: string,
    preferences: Preference[]
  ): RewardEvaluation {
    if (!text || text.trim().length === 0) {
      return {
        totalScore: 0,
        breakdown: { ruleAlignment: 0, concisenessScore: 0, formattingScore: 0, negativeAvoidance: 0 },
        matchedPreferences: [],
        violatedPreferences: [],
      };
    }

    const lowerText = text.toLowerCase();
    const matchedPreferences: string[] = [];
    const violatedPreferences: string[] = [];

    let preferHits = 0;
    let preferTotal = 0;
    let avoidHits = 0;
    let avoidTotal = 0;

    for (const pref of preferences) {
      if (pref.status !== 'active') continue;
      const prefKeywords = pref.preference
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 3);

      const hasKeywords = prefKeywords.some((w) => lowerText.includes(w));

      if (pref.polarity === 'prefer') {
        preferTotal++;
        if (hasKeywords) {
          preferHits++;
          matchedPreferences.push(pref.preference);
        }
      } else if (pref.polarity === 'avoid') {
        avoidTotal++;
        if (hasKeywords) {
          avoidHits++;
          violatedPreferences.push(pref.preference);
        }
      }
    }

    // Rule alignment calculation
    const preferScore = preferTotal > 0 ? preferHits / preferTotal : 0.8;
    const avoidScore = avoidTotal > 0 ? Math.max(0, 1 - avoidHits / avoidTotal) : 1.0;
    const ruleAlignment = (preferScore * 0.6 + avoidScore * 0.4);

    // Conciseness heuristic (penalize overly verbose filler like "Sure, I would be happy to help with that!")
    const fillerPatterns = [
      /as an ai/i,
      /i hope this helps/i,
      /feel free to ask/i,
      /certainly!/i,
      /i would be happy to/i,
    ];
    let fillerCount = 0;
    for (const pat of fillerPatterns) {
      if (pat.test(text)) fillerCount++;
    }
    const concisenessScore = Math.max(0.2, 1.0 - fillerCount * 0.25);

    // Formatting heuristic (reward structured markdown, code blocks, lists)
    const hasMarkdownHeaders = /#{1,4}\s/m.test(text);
    const hasCodeBlocks = /```[\s\S]*?```/m.test(text);
    const hasBulletPoints = /^\s*[-*]\s+/m.test(text);
    let formattingScore = 0.5;
    if (hasMarkdownHeaders || hasBulletPoints) formattingScore += 0.25;
    if (hasCodeBlocks) formattingScore += 0.25;
    formattingScore = Math.min(1.0, formattingScore);

    const negativeAvoidance = avoidScore;

    const totalScore = Number(
      (
        ruleAlignment * 0.45 +
        concisenessScore * 0.25 +
        formattingScore * 0.15 +
        negativeAvoidance * 0.15
      ).toFixed(3)
    );

    return {
      totalScore,
      breakdown: {
        ruleAlignment: Number(ruleAlignment.toFixed(3)),
        concisenessScore: Number(concisenessScore.toFixed(3)),
        formattingScore: Number(formattingScore.toFixed(3)),
        negativeAvoidance: Number(negativeAvoidance.toFixed(3)),
      },
      matchedPreferences,
      violatedPreferences,
    };
  }

  /**
   * Calculates the preference margin between chosen and rejected responses.
   */
  public computePairMargin(
    chosen: string,
    rejected: string,
    prompt: string,
    preferences: Preference[]
  ): number {
    const chosenEval = this.evaluateResponse(chosen, prompt, preferences);
    const rejectedEval = this.evaluateResponse(rejected, prompt, preferences);
    const margin = Number((chosenEval.totalScore - rejectedEval.totalScore).toFixed(3));
    return Math.max(0.05, margin);
  }
}

export const rewardService = new RewardService();
