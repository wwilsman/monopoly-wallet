import { useMemo } from 'react';
import { useDispatch } from 'react-redux';

import {
  newGame,
  connectToGame,
  disconnectGame,
  joinGame
} from './game';

import {
  push,
  replace,
  goBack
} from './router';

import {
  removeToast,
  voteInPoll
} from './toasts';

const {
  assign,
  entries
} = Object;

function wrap(dispatch, action) {
  return (...args) => dispatch(action(...args));
}

function useBoundActions(actions) {
  let dispatch = useDispatch();

  return useMemo(() => (
    entries(actions).reduce((acc, [name, action]) => (
      assign(acc, { [name]: wrap(dispatch, action) })
    ), {})
  ), [actions, dispatch]);
}

const gameActions = {
  newGame,
  connectToGame,
  disconnectGame,
  joinGame
};

export function useGameActions() {
  return useBoundActions(gameActions);
}

const routerActions = {
  push,
  replace,
  goBack
};

export function useRouterActions() {
  return useBoundActions(routerActions);
}

const toastActions = {
  removeToast,
  voteInPoll
};

export function useToastActions() {
  return useBoundActions(toastActions);
}
