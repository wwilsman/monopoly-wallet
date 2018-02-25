import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './button.css';

import Spinner from '../spinner';
import Link from '../link';

const cx = classNames.bind(styles);

const Button = ({
  type,
  disabled,
  loading,
  block,
  onClick,
  linkTo,
  children,
  ...props
}) => {
  let actuallyDisabled = loading || disabled;

  let className = cx('button', {
    [type]: !!type,
    'is-disabled': actuallyDisabled,
    'is-loading': loading,
    'is-block': block
  });

  let handleClick = (e) => {
    if (actuallyDisabled) {
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
        {...props}>
      {!loading ? children : <Spinner/>}
    </Link>
  ) : (
    <button
        className={className}
        disabled={actuallyDisabled}
        onClick={handleClick}
        {...props}>
      {!loading ? children : <Spinner/>}
    </button>
  );
};

Button.propTypes = {
  type: PropTypes.oneOf([
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
  children: PropTypes.any
};

export default Button;
