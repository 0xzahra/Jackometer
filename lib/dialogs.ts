import { emitConfirm, emitToast } from "./dialogStore";

export type DialogOptions = {
    message: string;
    type?: 'alert' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
};

export const customAlert = (message: string) => {
  emitToast({ message, type: "info" });
};

export const showToast = (
  message: string,
  type: "info" | "success" | "error" | "warning" = "info"
) => {
  emitToast({ message, type });
};

export const showConfirm = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  options?: {
    title?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  }
) => {
  emitConfirm({
    message,
    title: options?.title,
    confirmLabel: options?.confirmLabel,
    cancelLabel: options?.cancelLabel,
    onConfirm,
    onCancel,
  });
};

export const customConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    emitConfirm({
      message,
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
};

export const subscribeToDialogs = (listener: any) => () => {};
export const closeDialog = () => {};

