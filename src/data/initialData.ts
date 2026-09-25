import { 
  Project, 
  ChatConversation, 
  LearnedPreference, 
  ComparisonSession, 
  TrainingCandidate, 
  PromptTemplate,
  WorkspaceFile
} from '../types/workspace';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-creative-studio',
    name: 'Studio Portfolio Website',
    description: 'Minimalist creative technology studio portfolio with strict anti-slop guidelines.',
    createdAt: '2026-03-10T10:00:00Z',
    updatedAt: '2026-03-24T14:30:00Z',
    rules: [
      { id: 'rule-1', category: 'style', content: 'No gradients, no neon halos, no rounded pill containers for metadata', isActive: true },
      { id: 'rule-2', category: 'style', content: 'White canvas with graphite typography and subtle cobalt accent', isActive: true },
      { id: 'rule-3', category: 'tech', content: 'Use React + TypeScript with strict interfaces and zero any', isActive: true },
      { id: 'rule-4', category: 'constraint', content: 'Keep copy concise, no marketing fluff or fake metrics', isActive: true },
      { id: 'rule-5', category: 'style', content: 'Asymmetric grid layout with generous 48px+ margins', isActive: true },
    ],
    defaultModelId: 'gemini-3.1-pro-preview',
    fileIds: ['file-1', 'file-2'],
    chatIds: ['chat-portfolio-1'],
    tasteTags: ['Anti-Slop', 'Editorial', 'TypeScript', 'Clean Spacing'],
  },
  {
    id: 'proj-local-profiler',
    name: 'Neural Hardware Profiler',
    description: 'Profiling quantization tradeoffs and memory bandwidth across consumer GPUs and Unified Memory Macs.',
    createdAt: '2026-03-15T09:00:00Z',
    updatedAt: '2026-03-22T18:20:00Z',
    rules: [
      { id: 'rule-6', category: 'tech', content: 'Format all memory metrics with explicit GB units and tabular numerals', isActive: true },
      { id: 'rule-7', category: 'constraint', content: 'Distinguish official vendor requirements from community practical estimates', isActive: true },
    ],
    defaultModelId: 'gpt-oss-20b',
    fileIds: ['file-3'],
    chatIds: ['chat-local-hardware'],
    tasteTags: ['Hardware', 'Quantization', 'Local AI', 'GGUF'],
  }
];

export const INITIAL_CHATS: ChatConversation[] = [
  {
    id: 'chat-portfolio-1',
    title: 'Modern Portfolio Architecture',
    projectId: 'proj-creative-studio',
    createdAt: '2026-03-24T12:00:00Z',
    updatedAt: '2026-03-24T14:30:00Z',
    modelId: 'gemini-3.1-pro-preview',
    mode: 'deep reasoning',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Build me a modern portfolio website for our creative technology studio.',
        timestamp: '2026-03-24T12:00:00Z',
        modelId: 'user',
        modelName: 'User',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `Here is a modern hero design for your studio:\n\n\`\`\`tsx\nexport default function Hero() {\n  return (\n    <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-24 rounded-3xl m-6 shadow-2xl">\n      <div className="max-w-4xl mx-auto text-center space-y-6">\n        <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold">\n          ✨ Supercharge Your Digital Future ✨\n        </div>\n        <h1 className="text-6xl font-extrabold tracking-tight">\n          Next-Gen AI & Creative Engineering\n        </h1>\n        <p className="text-xl text-purple-100">\n          We build 10x disruptive web experiences using cutting-edge AI.\n        </p>\n        <div className="flex justify-center gap-4">\n          <button className="px-8 py-4 bg-white text-purple-700 font-bold rounded-full shadow-lg">\n            Explore Works\n          </button>\n        </div>\n      </div>\n    </section>\n  );\n}\n\`\`\``,
        timestamp: '2026-03-24T12:01:00Z',
        modelId: 'gemini-3.1-pro-preview',
        modelName: 'Gemini 3.1 Pro (High Thinking)',
        latencyMs: 1420,
        tokensUsed: 310,
        feedback: {
          id: 'fb-1',
          messageId: 'msg-2',
          sentiment: 'negative',
          reasons: ['Too generic', 'Poor visual design', 'Too robotic', 'Wrong assumptions'],
          suggestedAlternative: 'Strip the purple gradient, pill badge, and buzzwords. Use structured editorial typography and monochrome structure.',
          preferredVersion: 'Pure off-white canvas, stark serif/sans typography, asymmetric editorial layout, zero marketing cliches.',
          privacyScope: 'anonymous_shared',
          timestamp: '2026-03-24T12:02:15Z',
        }
      },
      {
        id: 'msg-3',
        role: 'user',
        content: "I don't like it. It feels like AI slop. Too many rounded cards, generic gradients and predictable sections. Make it feel like a real designer built it.",
        timestamp: '2026-03-24T12:03:00Z',
        modelId: 'user',
        modelName: 'User',
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: `Understood. Adapting to your preference: removing purple gradients, floating sparkles, pill badges, and hyperbolic copy.\n\nHere is an editorial, architectural composition designed around typographic tension, quiet negative space, and disciplined hairline borders:\n\n\`\`\`tsx\nexport default function StudioIndex() {\n  return (\n    <main className="min-h-screen bg-[#0e1014] text-[#f0f2f5] font-sans">\n      {/* Top Bar: Strict 3-zone contract, single element wordmark */}\n      <header className="flex items-center justify-between px-10 py-6 border-b border-[#232730]">\n        <span className="text-sm font-semibold tracking-tight text-white uppercase font-mono">\n          Vanguard Spatial Lab\n        </span>\n        <nav className="flex items-center gap-8 text-xs font-mono text-[#8c96a8] uppercase tracking-wider">\n          <a href="#work" className="hover:text-white transition-colors">01 / Index</a>\n          <a href="#systems" className="hover:text-white transition-colors">02 / Systems</a>\n          <a href="#monographs" className="hover:text-white transition-colors">03 / Papers</a>\n        </nav>\n        <span className="text-xs font-mono text-[#5c6575] tabular-nums">\n          52°31'N 13°24'E\n        </span>\n      </header>\n\n      {/* Hero: Asymmetric typographic anchor */}\n      <section className="px-10 pt-24 pb-32 max-w-7xl mx-auto border-x border-[#1c2028]">\n        <div className="grid grid-cols-12 gap-8 items-baseline">\n          <div className="col-span-12 lg:col-span-8">\n            <p className="text-xs font-mono text-[#3b82f6] uppercase tracking-widest mb-6">\n              Studio Practice — 2026\n            </p>\n            <h1 className="text-5xl lg:text-7xl font-medium tracking-tight leading-[1.08] text-balance">\n              Software instruments crafted for computational physics and autonomous agents.\n            </h1>\n          </div>\n          <div className="col-span-12 lg:col-span-4 lg:pl-8 text-sm text-[#8c96a8] leading-relaxed">\n            We reject ornamental web SaaS templates. Every layout is calibrated for spatial density, sub-millisecond execution, and unvarnished data clarity.\n          </div>\n        </div>\n      </section>\n    </main>\n  );\n}\n\`\`\`\n\n### Preference Learned & Updated:\n- **Avoided**: Generic rounded pill badges, purple-to-indigo gradients, "Supercharge" hype.\n- **Applied**: Architectural grid, monospaced coordinate metadata, editorial title balance, high contrast charcoal ground.`,
        timestamp: '2026-03-24T12:04:10Z',
        modelId: 'gemini-3.1-pro-preview',
        modelName: 'Gemini 3.1 Pro (High Thinking)',
        thinkingProcess: 'Analyzing user dissatisfaction: User explicitly flagged "AI slop", "too many rounded cards", "generic gradients", "predictable sections". Applying taste profile constraints: enforce anti-slop rules, zero-pill discipline, 60-30-10 palette with dark graphite base, clean monospaced metadata separators.',
        latencyMs: 1890,
        tokensUsed: 620,
        codeSnippets: [
          {
            id: 'code-1',
            language: 'typescript',
            filename: 'StudioIndex.tsx',
            code: `export default function StudioIndex() {\n  return (\n    <main className="min-h-screen bg-[#0e1014] text-[#f0f2f5] font-sans">\n      <header className="flex items-center justify-between px-10 py-6 border-b border-[#232730]">\n        <span className="text-sm font-semibold tracking-tight text-white uppercase font-mono">\n          Vanguard Spatial Lab\n        </span>\n        <nav className="flex items-center gap-8 text-xs font-mono text-[#8c96a8] uppercase tracking-wider">\n          <a href="#work" className="hover:text-white transition-colors">01 / Index</a>\n          <a href="#systems" className="hover:text-white transition-colors">02 / Systems</a>\n          <a href="#monographs" className="hover:text-white transition-colors">03 / Papers</a>\n        </nav>\n        <span className="text-xs font-mono text-[#5c6575] tabular-nums">\n          52°31'N 13°24'E\n        </span>\n      </header>\n      <section className="px-10 pt-24 pb-32 max-w-7xl mx-auto border-x border-[#1c2028]">\n        <div className="grid grid-cols-12 gap-8 items-baseline">\n          <div className="col-span-12 lg:col-span-8">\n            <p className="text-xs font-mono text-[#3b82f6] uppercase tracking-widest mb-6">\n              Studio Practice — 2026\n            </p>\n            <h1 className="text-5xl lg:text-7xl font-medium tracking-tight leading-[1.08] text-balance">\n              Software instruments crafted for computational physics and autonomous agents.\n            </h1>\n          </div>\n          <div className="col-span-12 lg:col-span-4 lg:pl-8 text-sm text-[#8c96a8] leading-relaxed">\n            We reject ornamental web SaaS templates. Every layout is calibrated for spatial density, sub-millisecond execution, and unvarnished data clarity.\n          </div>\n        </div>\n      </section>\n    </main>\n  );\n}`,
            description: 'Editorial Studio Portfolio Hero'
          }
        ]
      }
    ]
  },
  {
    id: 'chat-local-hardware',
    title: 'Ollama VRAM & Quantization Audit',
    projectId: 'proj-local-profiler',
    createdAt: '2026-03-22T14:10:00Z',
    updatedAt: '2026-03-22T15:45:00Z',
    modelId: 'gpt-oss-20b',
    mode: 'local/offline',
    isLocalOnly: true,
    messages: [
      {
        id: 'msg-local-1',
        role: 'user',
        content: 'I have an RTX 3060 with 12GB VRAM and 32GB system RAM on Linux. Can I run gpt-oss-20b with full context?',
        timestamp: '2026-03-22T14:10:00Z',
        modelId: 'user',
        modelName: 'User',
      },
      {
        id: 'msg-local-2',
        role: 'assistant',
        content: `**Hardware Evaluation: gpt-oss-20b on RTX 3060 (12GB VRAM) + 32GB RAM**\n\n### Practical Recommendation Breakdown\n- **Model Weight Footprint (Q4_K_M)**: ~11.8 GB\n- **KV Cache for 128K Context**: ~4.2 GB (at FP16) or ~2.1 GB (quantized Q4 KV cache)\n- **VRAM Verdict**: With standard Q4 weights, the model alone fits into your 12 GB VRAM. However, extending context beyond 32K tokens will spill the KV cache into your 32 GB system RAM.\n\n### Suggested Deployment Configuration\n\`\`\`bash\n# Run with 28 GPU layers offloaded (leaves room for KV cache in VRAM)\nollama run gpt-oss-20b:q4_k_m --ctx-size 32768\n\`\`\`\n\n**Expected Inference Experience**: ~28–34 tokens/sec within 32K context; dropping to ~12–16 tokens/sec if context exceeds 64K and leverages CPU paging.`,
        timestamp: '2026-03-22T14:11:05Z',
        modelId: 'gpt-oss-20b',
        modelName: 'gpt-oss-20b (Local)',
        latencyMs: 680,
        tokensUsed: 295,
      }
    ]
  }
];

export const INITIAL_PREFERENCES: LearnedPreference[] = [
  {
    id: 'pref-concise',
    category: 'Detail',
    title: 'Prefers concise, dense explanations',
    description: 'Avoid repetitive summaries or boilerplate greetings. Jump directly into code or structured bullets.',
    score: 8,
    confidence: 'High',
    evidenceCount: 17,
    lastUpdated: '2 hours ago',
    sourceType: 'Feedback Edit',
    status: 'active'
  },
  {
    id: 'pref-anti-slop',
    category: 'UI Design',
    title: 'Strict anti-AI-slop visual restraint',
    description: 'Avoid neon gradients, rounded-2xl cards with 1px borders, floating sparkles, and generic SaaS pill buttons.',
    score: 10,
    confidence: 'High',
    evidenceCount: 24,
    lastUpdated: 'Yesterday',
    sourceType: 'Explicit Thumbs',
    status: 'active'
  },
  {
    id: 'pref-editorial-type',
    category: 'UI Design',
    title: 'Editorial typography & unboxed metadata',
    description: 'Use characterful display typography paired with clean monospaced metadata separated by quiet dots (·) or slashes (/).',
    score: 9,
    confidence: 'High',
    evidenceCount: 19,
    lastUpdated: '3 days ago',
    sourceType: 'Comparison Winner',
    status: 'active'
  },
  {
    id: 'pref-strict-ts',
    category: 'Code',
    title: 'Strict TypeScript interfaces (Zero "any")',
    description: 'Always declare complete typed models, disciminative unions, and explicit return types without lazy shortcuts.',
    score: 9,
    confidence: 'High',
    evidenceCount: 31,
    lastUpdated: 'Today',
    sourceType: 'Direct Instruction',
    status: 'active'
  },
  {
    id: 'pref-direct-tone',
    category: 'Tone',
    title: 'Direct, objective communication',
    description: 'State trade-offs honestly without sycophantic praise or excessive enthusiasm.',
    score: 9,
    confidence: 'High',
    evidenceCount: 14,
    lastUpdated: '4 days ago',
    sourceType: 'Feedback Edit',
    status: 'active'
  },
  {
    id: 'pref-hardware-accuracy',
    category: 'Communication',
    title: 'Honest hardware requirement distinctions',
    description: 'Distinguish official vendor specs from community practical Q4 benchmarks; never over-promise inference speed.',
    score: 8,
    confidence: 'Medium',
    evidenceCount: 8,
    lastUpdated: '1 week ago',
    sourceType: 'Direct Instruction',
    status: 'active'
  }
];

export const PRELOADED_COMPARISON: ComparisonSession = {
  id: 'comp-studio-landing',
  prompt: 'Create a premium landing page concept for a creative technology studio.',
  timestamp: '2026-03-24T16:00:00Z',
  blindMode: false,
  chosenModelId: 'gemini-3.1-pro-preview',
  choiceReason: 'Showed superior visual restraint, followed anti-slop guidelines without reminders, and output complete responsive TSX code with zero placeholder comments.',
  candidates: [
    {
      modelId: 'gemini-3.1-pro-preview',
      modelName: 'Gemini 3.1 Pro (High Thinking)',
      response: `## Vanguard Studio: Architecture & Index\n\nStructure follows an asymmetric two-column broadsheet layout:\n- **Left Column (60%)**: Scaled typography in Plus Jakarta Sans with bold monospaced index flags.\n- **Right Column (40%)**: Live project coordinates, client monograph references, and technical stack matrix.\n- **Color System**: 60% deep graphite (#0c0d10), 30% structural hairline (#232730), 10% electric cobalt (#2563eb).\n\nNo floating cards or rainbow gradients. Full code provided in clean React/TypeScript.`,
      latencyMs: 1420,
      tokensUsed: 480,
      costEstimate: '$0.0024',
      thinkingDetails: 'Configured with ThinkingLevel.HIGH: evaluated layout integrity, anti-slop rules, zero-pill discipline, WCAG AA contrast ratio, and verified no mechanical // headers.'
    },
    {
      modelId: 'gpt-6-sol',
      modelName: 'GPT-6 Sol',
      response: `## Spatial Technology Studio\n\nFocuses on hyper-clean minimalism:\n- Top bar features strict 3-zone contract with single text brand mark.\n- Minimalist project roster with interactive line-item hover states.\n- Uses JetBrains Mono for telemetry figures and tabular data.\n- Complete responsive grid with CSS container queries.`,
      latencyMs: 1850,
      tokensUsed: 512,
      costEstimate: '$0.0041',
      thinkingDetails: 'Executed multi-step visual layout self-verification. Checked responsiveness across 1440px and 390px viewports.'
    },
    {
      modelId: 'claude-sonnet-5',
      modelName: 'Claude Sonnet 5',
      response: `## Studio Form & Logic\n\nEditorial design inspired by Swiss international typography:\n- High-contrast lead paragraphs with balanced text wrapping.\n- Structured project ledger replacing generic card grids.\n- Subtle keyboard navigation hooks (J/K list selection).\n- Accessible dark-mode palette with calibrated optical compensation.`,
      latencyMs: 1100,
      tokensUsed: 440,
      costEstimate: '$0.0022',
      thinkingDetails: 'Applied typographic hierarchy rules and eliminated generic SaaS design tropes.'
    },
    {
      modelId: 'gpt-oss-20b',
      modelName: 'gpt-oss-20b (Local)',
      response: `## Local Inference Studio Design\n\nRuns fully on-device without cloud data exposure:\n- Zero tracking, local memory rules loaded from disk.\n- Clean lightweight HTML/CSS structure optimized for fast rendering.\n- Direct code snippets without unnecessary conversational padding.`,
      latencyMs: 820,
      tokensUsed: 390,
      costEstimate: 'Free (Local)',
      thinkingDetails: 'Executed on local Ollama runtime with Q4_K_M quantization.'
    }
  ]
};

export const INITIAL_FILES: WorkspaceFile[] = [
  {
    id: 'file-1',
    name: 'brand-guidelines-2026.md',
    size: 24500,
    extension: 'md',
    uploadedAt: '2026-03-20T11:00:00Z',
    content: '# Vanguard Studio Brand Guidelines\n- Colors: Canvas #0c0d10, Hairline #232730, Accent #2563eb\n- Fonts: Plus Jakarta Sans & JetBrains Mono\n- Voice: Rigorous, clear, anti-hype.',
    scope: 'project',
    projectId: 'proj-creative-studio'
  },
  {
    id: 'file-2',
    name: 'portfolio_schema.json',
    size: 8900,
    extension: 'json',
    uploadedAt: '2026-03-21T09:30:00Z',
    content: '{\n  "projects": [\n    { "title": "Neural Optics", "year": 2026, "type": "Autonomous Agent" }\n  ]\n}',
    scope: 'project',
    projectId: 'proj-creative-studio'
  },
  {
    id: 'file-3',
    name: 'gpu_vram_benchmarks.csv',
    size: 42100,
    extension: 'csv',
    uploadedAt: '2026-03-18T16:15:00Z',
    content: 'model,quant,ctx,vram_gb,tps\ngpt-oss-20b,Q4_K_M,32k,11.8,32.4\nMinistral-3-8B,Q4,64k,6.2,54.1',
    scope: 'workspace'
  }
];

export const INITIAL_TRAINING_CANDIDATES: TrainingCandidate[] = [
  {
    id: 'train-1',
    type: 'DPO',
    status: 'Approved',
    taskCategory: 'UI Architecture',
    promptSnippet: 'Build me a modern portfolio website for our creative technology studio.',
    chosenSnippet: 'Architectural index with monospaced metadata and zero rounded pill badges...',
    rejectedSnippet: 'Purple-to-indigo gradient with ✨ Supercharge Your Digital Future ✨ pill badge...',
    feedbackReason: 'User rejected generic AI slop. Prefers disciplined editorial typography.',
    privacyVerified: true,
    sourceModel: 'Gemini 3.1 Pro / GPT-6 Sol',
    timestamp: '2026-03-24T12:05:00Z'
  },
  {
    id: 'train-2',
    type: 'SFT',
    status: 'Captured',
    taskCategory: 'Local Hardware Estimation',
    promptSnippet: 'Can I run gpt-oss-20b on RTX 3060 12GB?',
    chosenSnippet: 'Direct calculation separating Q4 model weights (11.8GB) from KV cache...',
    rejectedSnippet: 'Vague assertion that 12GB is plenty without mentioning context size...',
    feedbackReason: 'Requires exact memory calculations distinguishing model weights from context KV cache.',
    privacyVerified: true,
    sourceModel: 'gpt-oss-20b',
    timestamp: '2026-03-22T14:15:00Z'
  },
  {
    id: 'train-3',
    type: 'KTO',
    status: 'Approved',
    taskCategory: 'TypeScript Code Quality',
    promptSnippet: 'Write a model router adapter for local Ollama endpoints.',
    chosenSnippet: 'Strict Discriminated Union with runtime Zod/Type validation and zero "any"...',
    rejectedSnippet: 'Used `any` for request payloads and assumed localhost never throws...',
    feedbackReason: 'High quality code with error propagation and strict types.',
    privacyVerified: true,
    sourceModel: 'Claude Sonnet 5',
    timestamp: '2026-03-20T08:30:00Z'
  }
];

export const INITIAL_PROMPTS: PromptTemplate[] = [
  {
    id: 'prompt-1',
    title: 'Architectural Web App Blueprint',
    description: 'Generates a distinctive, production-grade frontend layout adhering to anti-slop rules.',
    category: 'Design',
    prompt: 'Create a production-grade {{technology}} interface for {{project}}. Follow a {{style}} visual language with strict typography hierarchy, zero pill badges, and no generic gradients. Target audience: {{audience}}.',
    variables: ['technology', 'project', 'style', 'audience'],
    favorite: true
  },
  {
    id: 'prompt-2',
    title: 'Strict TypeScript Component Refactor',
    description: 'Eliminates any types, adds discriminated unions, and handles loading/error states.',
    category: 'Coding',
    prompt: 'Refactor the following {{technology}} code for {{project}}. Ensure 100% strict TypeScript types with no "any", accessible ARIA states, and handle empty and error states.',
    variables: ['technology', 'project'],
    favorite: true
  },
  {
    id: 'prompt-3',
    title: 'Local Hardware Feasibility Audit',
    description: 'Calculates VRAM, RAM, and context cache requirements for open-weight models.',
    category: 'Research',
    prompt: 'Audit whether my hardware ({{gpu}}, {{vram}}, {{ram}}) can execute {{model}} at {{contextWindow}} context. Distinguish official vendor requirements from practical Q4 recommendations.',
    variables: ['gpu', 'vram', 'ram', 'model', 'contextWindow'],
    favorite: false
  }
];
