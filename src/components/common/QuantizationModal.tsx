import React from 'react';
import { X, Layers, CheckCircle2, HelpCircle } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

export const QuantizationModal: React.FC = () => {
  const { quantizationModalOpen, setQuantizationModalOpen, hardwareProfile } = useWorkspace();

  if (!quantizationModalOpen) return null;

  const quantLevels = [
    {
      format: 'Q4_K_M',
      bits: '4-bit',
      sizeFactor: '30% of full size',
      loss: '< 2% loss',
      vramTarget: '8–12 GB VRAM (Most Laptops & Desktops)',
      description: 'The golden standard for running local AI on consumer PCs. Shrinks large 20GB+ models down to ~5GB so they run smoothly.',
      recommended: true,
    },
    {
      format: 'Q5_K_M',
      bits: '5-bit',
      sizeFactor: '38% of full size',
      loss: '< 1% loss',
      vramTarget: '12–16 GB VRAM',
      description: 'Great for programming and mathematics where exact syntax and numbers matter.',
      recommended: false,
    },
    {
      format: 'Q8_0',
      bits: '8-bit',
      sizeFactor: '55% of full size',
      loss: 'Near Zero (< 0.2%)',
      vramTarget: '16–24 GB VRAM',
      description: 'Nearly identical to the original uncompressed model, but requires more graphics memory.',
      recommended: false,
    },
    {
      format: 'FP16 (Full)',
      bits: '16-bit',
      sizeFactor: '100% (Full)',
      loss: '0% (Exact baseline)',
      vramTarget: 'Cloud Servers / Multi-GPU',
      description: 'Uncompressed raw weights. Requires enterprise servers or multi-GPU rigs.',
      recommended: false,
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      onClick={() => setQuantizationModalOpen(false)}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-[#E7E9EE] overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                What does Q4, Q5, and Quantization mean?
              </h2>
              <p className="text-xs text-gray-500">
                How AI models are compressed to run on everyday computers.
              </p>
            </div>
          </div>
          <button
            onClick={() => setQuantizationModalOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 bg-[#F7F8FA]">
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 leading-relaxed">
            <strong>Simple explanation:</strong> AI models are made of billions of numbers (weights). <em>Quantization</em> rounds these numbers from 16 bits down to 4 or 5 bits—reducing file size by 70% while keeping almost all of the model's intelligence!
          </div>

          <div className="space-y-3">
            {quantLevels.map((lvl) => (
              <div
                key={lvl.format}
                className={`p-4 rounded-xl border bg-white shadow-2xs space-y-2 ${
                  lvl.recommended ? 'border-blue-500 ring-2 ring-blue-50' : 'border-[#E7E9EE]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 font-mono">
                      {lvl.format}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                      {lvl.bits}
                    </span>
                    {lvl.recommended && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                        Recommended for You
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{lvl.sizeFactor}</span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {lvl.description}
                </p>

                <div className="pt-1 text-[11px] text-gray-500 flex items-center justify-between">
                  <span>Hardware target: <strong className="text-gray-700">{lvl.vramTarget}</strong></span>
                  <span className="text-emerald-700 font-medium">{lvl.loss}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end shrink-0">
          <button
            onClick={() => setQuantizationModalOpen(false)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
