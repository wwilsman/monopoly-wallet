import { event, emit } from './socket';

// action types
export const TOASTS_REMOVE = 'TOASTS/REMOVE';

// action creators
export const removeToast = (id) => ({
  type: TOASTS_REMOVE,
  toast: { id }
});

export const voteInPoll = emit.bind(null, 'poll:vote');

// single toast reducer
const toast = (state = {}, action) => {
  switch (action.type) {
    case event('poll:new'):
      return {
        id: action.poll.id,
        message: action.poll.message,
        type: 'poll'
      };

    default:
      return state;
  }
};

// toasts reducer
export const reducer = (state = [], action) => {
  switch (action.type) {
    case event('poll:new'):
      return [...state,
        toast(undefined, action)
      ];

    case event('poll:end'):
      return state.filter((toast) => (
        toast.id !== action.poll.id
      ));

    case TOASTS_REMOVE:
      return state.filter((toast) => (
        toast.id !== action.toast.id
      ));

    default:
      return state;
  }
};
