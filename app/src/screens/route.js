import React, { Children, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import pathToRegexp from 'path-to-regexp';

import { useRouterActions } from '../redux/actions';

const selectLocation = createSelector(
  ({ router }) => router,
  ({ location }) => location
);

export function useLocation() {
  return useSelector(selectLocation);
}

export function usePath(path) {
  let { pathname } = useLocation();

  return useMemo(() => {
    let tokens = [];
    let re = pathToRegexp(path, tokens);
    let match = re.exec(pathname);
    let params = match ? tokens.reduce((p, { name }, i) => (
      !name ? p : { ...p, [name]: match[i + 1] }
    ), {}) : {};

    return { match: !!match, params };
  }, [path, pathname]);
}

Route.propTypes = {
  path: PropTypes.string.isRequired,
  redirect: PropTypes.string,
  render: PropTypes.func,
  children: PropTypes.node
};

export default function Route({
  path,
  redirect,
  render: Component,
  children
}) {
  let location = useLocation();
  let actions = useRouterActions();
  let { match, params } = usePath(path);

  let child = useMemo(() => (
    Children.toArray(children).find(child => {
      let re = pathToRegexp(child.props.path, [], { end: true });
      return !!re.exec(location.pathname);
    })
  ), [children, location.pathname]);

  if (!child && redirect) {
    actions.replace(redirect);
  }

  return match ? (
    <Component
      params={params}
      location={location}
      {...actions}
    >
      {child}
    </Component>
  ) : null;
}
