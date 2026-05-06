export type DialogOptions = {
    message: string;
    type?: 'alert' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
};

type DialogState = DialogOptions & { isOpen: boolean };

let dialogState: DialogState = { isOpen: false, message: '', type: 'alert' };
let listeners: ((state: DialogState) => void)[] = [];

export const subscribeToDialogs = (listener: (state: DialogState) => void) => {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter(l => l !== listener);
    };
};

const updateState = (newState: Partial<DialogState>) => {
    dialogState = { ...dialogState, ...newState };
    listeners.forEach(l => l(dialogState));
};

export const customAlert = (message: string) => {
    updateState({ isOpen: true, message, type: 'alert' });
};

export const customConfirm = (message: string): Promise<boolean> => {
    return new Promise(resolve => {
        updateState({
            isOpen: true,
            message,
            type: 'confirm',
            onConfirm: () => {
                updateState({ isOpen: false });
                resolve(true);
            },
            onCancel: () => {
                updateState({ isOpen: false });
                resolve(false);
            }
        });
    });
};

export const closeDialog = () => {
    updateState({ isOpen: false });
};
