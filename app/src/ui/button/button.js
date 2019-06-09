import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './button.css';

import Spinner from '../spinner';
import Link from '../link';

const cx = classNames.bind(styles);

Button.propTypes = {
  style: PropTypes.oneOf([
    'primary',
    'secondary',
    'alert',
    'icon'
  ]).isRequired,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  block: PropTypes.bool,
  onClick: PropTypes.func,
  linkTo: PropTypes.string,
  children: PropTypes.node
};

export default function Button ({
  style,
  disabled,
  loading,
  block,
  onClick,
  linkTo,
  children,
  ...props
}) {
  disabled = loading || disabled;

  let className = cx('button', {
    [style]: !!style,
    'is-disabled': disabled,
    'is-loading': loading,
    'is-block': block
  });

  let handleClick = e => {
    if (disabled) {
      e.preventDefault();
    } else if (onClick) {
      onClick(e);
    }
  };

  return linkTo ? (
    <Link
      to={linkTo}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {!loading ? children : <Spinner/>}
    </Link>
  ) : (
    <button
      className={className}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {!loading ? children : <Spinner/>}
    </button>
  );
}
