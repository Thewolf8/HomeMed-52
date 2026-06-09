import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';

const toastConfig = {
  success: { border: 'border-l-emerald-500', icon: <CheckCircle className="h-4 w-4 text-emerald-500" /> },
  error: { border: 'border-l-red-500', icon: <XCircle className="h-4 w-4 text-red-500" /> },
  warning: { border: 'border-l-amber-500', icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
  info: { border: 'border-l-teal-500', icon: <Info className="h-4 w-4 text-teal-500" /> },
};

export function ToastContainer() {
  const { toasts, dismissToast } = useToastContext();

  return (
    <div className="fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => {
          const config = toastConfig[toast.type];
          const offset = (toasts.length - 1 - index) * -8;
          const scale = 1 - (toasts.length - 1 - index) * 0.02;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ x: 120, opacity: 0 }}
              animate={{ x: 0, opacity: 1, y: offset, scale }}
              exit={{ x: 120, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`relative flex items-start gap-3 rounded-xl border border-slate-700/50 bg-slate-800/95 p-4 shadow-xl backdrop-blur-sm ${config.border} border-l-[3px]`}
            >
              {config.icon}
              <div className="flex-1">
                <p className="text-sm text-slate-100">{toast.message}</p>
                {toast.undo && (
                  <button
                    onClick={() => {
                      toast.undo?.();
                      dismissToast(toast.id);
                    }}
                    className="mt-1 text-xs font-medium text-teal-400 hover:text-teal-300"
                  >
                    Undo
                  </button>
                )}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="rounded-md p-0.5 text-slate-500 transition-colors hover:text-slate-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
