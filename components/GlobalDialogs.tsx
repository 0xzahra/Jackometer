import React, { useEffect, useState } from 'react';
import { subscribeToDialogs, closeDialog } from '../lib/dialogs';

export const GlobalDialogs: React.FC = () => {
    const [state, setState] = useState({ isOpen: false, message: '', type: 'alert' as 'alert' | 'confirm', onConfirm: undefined as any, onCancel: undefined as any });

    useEffect(() => {
        return subscribeToDialogs(setState);
    }, []);

    if (!state.isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--surface-color)] p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 border border-[var(--border-color)] animate-[fade-in_0.2s_ease-out]">
                <div className="flex items-center gap-3 mb-4">
                    <span className={`material-icons text-2xl ${state.type === 'alert' ? 'text-blue-500' : 'text-amber-500'}`}>
                        {state.type === 'alert' ? 'info' : 'help_outline'}
                    </span>
                    <h3 className="font-bold text-lg text-[var(--text-primary)]">
                        {state.type === 'alert' ? 'Notification' : 'Confirmation Needed'}
                    </h3>
                </div>
                <p className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed">{state.message}</p>
                
                <div className="flex justify-end gap-3 font-bold text-sm">
                    {state.type === 'confirm' && (
                        <button 
                            onClick={state.onCancel}
                            className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                    <button 
                        onClick={() => {
                            if (state.type === 'confirm') {
                                state.onConfirm?.();
                            } else {
                                closeDialog();
                            }
                        }}
                        className={`px-4 py-2 rounded-lg text-white shadow transition-all hover:opacity-90 ${state.type === 'confirm' ? 'bg-amber-600' : 'bg-[var(--accent)]'}`}
                    >
                        {state.type === 'confirm' ? 'Confirm' : 'OK'}
                    </button>
                </div>
            </div>
        </div>
    );
};
