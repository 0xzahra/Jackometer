export type ConfirmPayload = {
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export type ToastPayload = {
  message: string;
  type?: "info" | "success" | "error" | "warning";
};

export const DIALOG_CONFIRM_EVENT = "app-dialog-confirm";
export const DIALOG_TOAST_EVENT = "app-dialog-toast";

export function emitConfirm(payload: ConfirmPayload) {
  window.dispatchEvent(
    new CustomEvent<ConfirmPayload>(DIALOG_CONFIRM_EVENT, { detail: payload })
  );
}

export function emitToast(payload: ToastPayload) {
  window.dispatchEvent(
    new CustomEvent<ToastPayload>(DIALOG_TOAST_EVENT, { detail: payload })
  );
}
