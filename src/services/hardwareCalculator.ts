import { ModelDefinition, HardwareSpec, CompatibilityResult, QuantizationType } from '../types/models';
import { ALL_MODELS } from '../data/modelRegistry';

export function calculateCompatibility(model: ModelDefinition, hardware: HardwareSpec): CompatibilityResult {
  // If the model is an online cloud API, hardware does not constrain inference
  if (model.online && !model.local) {
    return {
      tier: 'Good',
      summary: 'Cloud-hosted model. Inference runs on remote provider infrastructure; your local hardware is not a bottleneck.',
      ramVerdict: {
        provided: hardware.ramGb,
        minimum: 4,
        recommended: 8,
        passed: true,
      },
      vramVerdict: {
        provided: hardware.vramGb,
        minimum: 0,
        recommended: 0,
        passed: true,
      },
      storageVerdict: {
        provided: hardware.freeStorageGb,
        required: 1,
        passed: true,
      },
      suggestedQuantization: 'BF16',
      expectedExperience: 'Immediate cloud streaming. Network latency is the only variable.',
      alternatives: [],
    };
  }

  // Parse required storage in GB
  const storageRequiredGb = parseFloat(model.estimatedStorage?.replace(/[^\d.]/g, '') || '10');

  const minRam = model.minimumRam;
  const recRam = model.recommendedRam;
  const minVram = model.minimumVram;
  const recVram = model.recommendedVram;

  const ramPassed = hardware.ramGb >= minRam;
  const vramPassed = hardware.vramGb >= minVram;
  const storagePassed = hardware.freeStorageGb >= storageRequiredGb;

  let tier: 'Good' | 'Limited' | 'Not recommended' = 'Good';
  let expectedExperience = '';
  let suggestedQuantization: QuantizationType = 'Q4_K_M';

  // Extreme or Server-only models
  if (model.isHighEndServerOnly || model.difficulty === 'Server Only' || model.difficulty === 'Extreme') {
    if (hardware.vramGb < minVram || hardware.ramGb < minRam) {
      tier = 'Not recommended';
      expectedExperience = 'Will fail to load into memory or crash with Out-Of-Memory (OOM) error. Intended for enterprise multi-GPU servers.';
    } else if (hardware.vramGb < recVram) {
      tier = 'Limited';
      expectedExperience = 'Can load with significant CPU layer offloading. Token generation will be very slow (~1–4 tokens/sec).';
    } else {
      tier = 'Good';
      expectedExperience = 'Heavy workstation load. Smooth inference expected (~15–25 tokens/sec).';
    }
  } else {
    // Consumer models
    if (!storagePassed) {
      tier = 'Not recommended';
      expectedExperience = `Insufficient disk storage. Model requires at least ${storageRequiredGb} GB free SSD space.`;
    } else if (!ramPassed && !vramPassed) {
      tier = 'Not recommended';
      expectedExperience = 'Hardware below minimum specs. Model will crash or cause extreme system freezing.';
    } else if (hardware.vramGb >= recVram && hardware.ramGb >= recRam) {
      tier = 'Good';
      suggestedQuantization = hardware.vramGb >= recVram + 4 ? 'Q8' : 'Q5';
      expectedExperience = 'Optimal performance. Full GPU layer offloading; fast token generation (~35–60 tokens/sec).';
    } else if (hardware.vramGb >= minVram || hardware.ramGb >= minRam) {
      tier = 'Limited';
      suggestedQuantization = 'Q4';
      expectedExperience = 'Moderate performance. Partial CPU offloading required. Expect 12–22 tokens/sec depending on context length.';
    } else {
      tier = 'Not recommended';
      expectedExperience = 'System memory is too constrained for this parameter count.';
    }
  }

  // Find sensible smaller alternatives if not ideal
  const alternatives = ALL_MODELS
    .filter(m => m.local && m.id !== model.id && !m.isHighEndServerOnly)
    .filter(m => hardware.ramGb >= m.minimumRam && (hardware.vramGb >= m.minimumVram || hardware.ramGb >= m.recommendedRam))
    .slice(0, 3)
    .map(alt => ({
      id: alt.id,
      name: alt.displayName,
      reason: `Requires only ${alt.recommendedRam} GB RAM / ${alt.recommendedVram} GB VRAM. Optimal for your ${hardware.gpu || 'current GPU'}.`,
    }));

  const summary = tier === 'Good'
    ? `Your PC meets practical recommendations for ${model.displayName}.`
    : tier === 'Limited'
    ? `Can run with quantization tradeoffs, but expect slower generation or reduced context.`
    : `This model exceeds your system capacity. Consider a smaller quantized alternative.`;

  return {
    tier,
    summary,
    ramVerdict: {
      provided: hardware.ramGb,
      minimum: minRam,
      recommended: recRam,
      passed: ramPassed,
    },
    vramVerdict: {
      provided: hardware.vramGb,
      minimum: minVram,
      recommended: recVram,
      passed: vramPassed,
    },
    storageVerdict: {
      provided: hardware.freeStorageGb,
      required: storageRequiredGb,
      passed: storagePassed,
    },
    suggestedQuantization,
    expectedExperience,
    alternatives,
  };
}
