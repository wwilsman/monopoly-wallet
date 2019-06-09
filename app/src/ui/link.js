import React from 'react';
import PropTypes from 'prop-types';

import { useRouterActions } from '../redux/actions';

Link.propTypes = {
  to: PropTypes.string.isRequired,
  onClick: PropTypes.func
};

export default function Link({ to, onClick, ...props }) {
  let { push } = useRouterActions();

  let handleClick = (e) => {
    let bubble = onClick && onClick(e);

    if (bubble !== false && !e.defaultPrevented) {
      e.preventDefault();
      push(to);
    }

    return bubble;
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      {...props}
    />
  );
}
