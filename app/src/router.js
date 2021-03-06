import React, {
  Children,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import PropTypes from 'prop-types';
import { pathToRegexp } from 'path-to-regexp';

const Context = React.createContext();

export function useRouter() {
  return useContext(Context);
}

export function useRoute(path) {
  let router = useRouter();

  let route = useMemo(() => {
    let tokens = [];
    let re = pathToRegexp(path, tokens);
    let match = re.exec(router.location.pathname);
    let params = match ? tokens.reduce((p, { name }, i) => (
      !name ? p : { ...p, [name]: match[i + 1] }
    ), {}) : {};

    return { match: !!match, params };
  }, [path, router.location.pathname]);

  return [router, route];
}

Route.propTypes = {
  path: PropTypes.string.isRequired,
  redirect: PropTypes.string,
  render: PropTypes.func,
  children: PropTypes.node
};

export function Route({
  path,
  redirect,
  render: Component,
  children
}) {
  let [router, { match, params }] = useRoute(path);

  let child = useMemo(() => (
    Children.toArray(children).find(child => {
      let re = pathToRegexp(child.props.path, [], { strict: true });
      return !!re.exec(router.location.pathname);
    }) || null
  ), [children, router.location.pathname]);

  redirect = !child && redirect;
  useEffect(() => void(redirect && router.replace(redirect)), [redirect]);

  return !redirect && match ? (
    <Component params={params} {...router}>
      {child}
    </Component>
  ) : null;
}

function internalize(fn) {
  return (to, state = {}) => {
    fn(to, { internal: true, ...state });
  };
}

Router.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.node
};

export default function Router({
  history,
  children
}) {
  let [location, setLocation] = useState(history.location);
  let [ready, setReady] = useState(false);

  let router = useMemo(() => ({
    push: internalize(history.push),
    replace: internalize(history.replace),
    back: history.back,
    location
  }), [history, location]);

  useEffect(() => {
    // wait until listening so route effects happen after this
    setReady(true);

    return history.listen(({ location }) => {
      setLocation(location);
    });
  }, [history]);

  return (
    <Context.Provider value={router}>
      {ready && children}
    </Context.Provider>
  );
}
