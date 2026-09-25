import React from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { notifications } = useWorkspace();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
      {notifications.map((n) => {
        const isSuccess = n.type === 'success';
        const isWarn = n.type === 'warn';
        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 bg-white border rounded-xl text-xs shadow-lg transition-all ${
              isSuccess
                ? 'border-emerald-200 text-emerald-900'
                : isWarn
                ? 'border-amber-200 text-amber-900'
                : 'border-[#E7E9EE] text-gray-900'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {isWarn && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
            {!isSuccess && !isWarn && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
            <span className="font-medium text-xs leading-tight">{n.message}</span>
          </div>
        );
      })}
    </div>
  );
};
