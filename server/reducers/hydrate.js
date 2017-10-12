import { HYDRATE } from '../actions/hydrate';

export default function hydratable(reducer) {
  return (state, action) => {
    switch (action.type) {
      case HYDRATE:
        return reducer(action.state, action);
      default:
        return reducer(state, action);
    }
  };
}
