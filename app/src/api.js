import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react';
import PropTypes from 'prop-types';
import { createPlayerEmitter } from './helpers/emitter';

const EmitterContext = React.createContext();
const GameContext = React.createContext();

export function useEmitter() {
  return useContext(EmitterContext);
}

export function useGame() {
  return useContext(GameContext);
}

export function useGameEffect(effect) {
  let game = useGame();
  let ref = useRef(game);

  useEffect(() => {
    let prev = ref.current;
    ref.current = game;
    effect(game, prev);
  }, [game]);
}

export function useEmit(event) {
  let emitter = useEmitter();
  let [response, setResponse] = useState({ pending: false });

  let mounted = useRef(true);
  useEffect(() => () => mounted.current = false, []);

  let emit = useCallback((...args) => {
    setResponse({ pending: true });

    emitter.send(event, ...args)
      .then(data => {
        if (mounted.current) {
          setResponse({ ok: true, pending: false, data });
        }
      })
      .catch(error => {
        if (mounted.current) {
          setResponse({ ok: false, pending: false, error });
        }
      });
  }, [event, emitter]);

  return [emit, response];
}

ApiProvider.propTypes = {
  children: PropTypes.node.isRequired,
  onUpdate: PropTypes.func
};

export default function ApiProvider({
  onUpdate,
  children
}) {
  let [game, update] = useReducer((state, incoming) => {
    if (incoming) {
      return (incoming.timestamp ?? 0) >= (state.timestamp ?? 0)
        ? { ...state, ...incoming }
        : { ...incoming, ...state };
    } else if (incoming === null) {
      return {};
    } else {
      return state;
    }
  }, {});

  let e = useRef(null);
  let [disconnects, disconnect] = useReducer(i => i + 1, 0);
  useEffect(() => onUpdate?.(game), [game]);

  useEffect(() => {
    let emitter = e.current = createPlayerEmitter();

    emitter.on('room:sync', update);
    emitter.on('game:update', update);
    emitter.on('response:ok', (_, state) => update(state));
    emitter.on('connected', () => update({ connected: true }));
    emitter.on('close', () => {
      disconnect();
      update(null);
    });

    return () => emitter.removeAllListeners();
  }, [disconnects]);

  return (
    <EmitterContext.Provider value={e.current}>
      <GameContext.Provider value={game}>
        {children}
      </GameContext.Provider>
    </EmitterContext.Provider>
  );
}
