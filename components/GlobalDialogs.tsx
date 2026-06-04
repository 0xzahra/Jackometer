import React, { useEffect, useState } from 'react';
import { ConfirmPayload, ToastPayload, DIALOG_CONFIRM_EVENT, DIALOG_TOAST_EVENT } from '../lib/dialogStore';

export const GlobalDialogs: React.FC = () => {
  const [confirm, setConfirm] = useState<ConfirmPayload | null>(null);
  const [toasts, setToasts] = useState<(ToastPayload & { id: number })[]>([]);

  useEffect(() => {
    const handleConfirm = (e: CustomEvent<ConfirmPayload>) => {
      setConfirm(e.detail);
    };

    const handleToast = (e: CustomEvent<ToastPayload>) => {
      const newToast = { ...e.detail, id: Date.now() };
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3000);
    };

    window.addEventListener(DIALOG_CONFIRM_EVENT as any, handleConfirm);
    window.addEventListener(DIALOG_TOAST_EVENT as any, handleToast);

    return () => {
      window.removeEventListener(DIALOG_CONFIRM_EVENT as any, handleConfirm);
      window.removeEventListener(DIALOG_TOAST_EVENT as any, handleToast);
    };
  }, []);

  return (
    <>
      {/* Toast Overlay */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded shadow-lg text-white font-medium text-sm animate-fade-in-up ${
              toast.type === 'error'
                ? 'bg-red-600'
                : toast.type === 'success'
                ? 'bg-[var(--accent)]'
                : toast.type === 'warning'
                ? 'bg-amber-600'
                : 'bg-slate-800'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {confirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm animate-fade-in-up">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {confirm.title || 'Confirm Action'}
            </h3>
            <p className="text-slate-600 text-sm mb-6">{confirm.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  if (confirm.onCancel) confirm.onCancel();
                  setConfirm(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded"
              >
                {confirm.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={() => {
                  confirm.onConfirm();
                  setConfirm(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90 rounded"
              >
                {confirm.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

