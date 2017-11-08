// action types
export const TOASTS_ADD = 'TOASTS_ADD';
export const TOASTS_REMOVE = 'TOASTS_REMOVE';

// action creators
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

// toast id helpers
const uid = () => {
  const n = uid.n = (uid.n || 0) + 1;
  return `toast-${n}`;
};

// single toast reducer
const toast = (state = {}, action) => {
  switch (action.type) {
    case TOASTS_ADD:
      return {
        id: action.toast.id || uid(),
        type: action.toast.type,
        message: action.toast.message,
        actions: action.toast.actions || [],
        timeout: action.toast.timeout
      };

    default:
      return state;
  }
};

// toasts reducer
export const reducer = (state = [], action) => {
  switch (action.type) {
    case TOASTS_ADD:
      return [...state,
        toast(undefined, action)
      ];

    case TOASTS_REMOVE:
      return state.filter((toast) => (
        toast.id !== action.toast.id
      ));

    default:
      return state;
  }
};
