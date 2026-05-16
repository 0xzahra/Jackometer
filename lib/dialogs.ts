export type DialogOptions = {
    message: string;
    type?: 'alert' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
};

export const customAlert = (message: string) => {
    window.alert(message);
};

export const customConfirm = async (message: string): Promise<boolean> => {
    return window.confirm(message);
};

export const subscribeToDialogs = (listener: any) => () => {};
export const closeDialog = () => {};
