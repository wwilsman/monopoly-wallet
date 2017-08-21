import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './button.css';

import Spinner from '../spinner';

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
  const className = cx('button', {
    [type]: !!type,
    'is-disabled': disabled,
    'is-loading': loading,
    'is-block': block
  });

  return linkTo && !(disabled || loading) ? (
    <Link
        to={linkTo}
        className={className}
        {...props}>
      {children}
    </Link>
  ) : (
    <button
        className={className}
        onClick={!(disabled || loading) && onClick}
        disabled={disabled}
        {...props}>
      {!loading ? children : <Spinner/>}
    </button>
  );
};

Button.propTypes = {
  type: PropTypes.oneOf([
    'primary',
    'secondary',
    'alert'
  ]).isRequired,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  block: PropTypes.bool,
  onClick: PropTypes.func,
  linkTo: PropTypes.string,
  children: PropTypes.any
};

export default Button;
