import {
  TOASTS_ADD,
  TOASTS_REMOVE
} from '../actions/toasts';

const uid = () => {
  const n = uid.n = (uid.n || 0) + 1;
  return `toast-${n}`;
};

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

export default (state = [], action) => {
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
