export const TOASTS_ADD = 'TOASTS_ADD';
export const TOASTS_REMOVE = 'TOASTS_REMOVE';

export const newToast = (type, message, timeout) => ({
  type: TOASTS_ADD,
  toast: {
    type,
    message,
    timeout
  }
});

export const newPoll = (id, message, actions, timeout) => ({
  type: TOASTS_ADD,
  toast: {
    id,
    type: 'attention',
    message,
    actions,
    timeout
  }
});

export const removeToast = (id) => ({
  type: TOASTS_REMOVE,
  toast: { id }
});
