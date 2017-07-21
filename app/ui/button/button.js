import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './button.css';

const cx = classNames.bind(styles);

const Button = ({
  color,
  disabled,
  loading,
  small,
  block,
  onClick,
  linkTo,
  children,
  ...props
}) => {
  const className = cx('button', {
    'block': block,
    'small': small,
    'is-disabled': disabled,
    'is-loading': loading,
    [color]: !!color
  });

  return linkTo && !(disabled || loading) ? (
    <Link
        to={linkTo}
        className={className}
        children={children}
        {...props}/>
  ) : (
    <button
        className={className}
        onClick={!(disabled || loading) && onClick}
        disabled={disabled}
        {...props}>
      {loading ? '...' : children}
    </button>
  );
};

Button.propTypes = {
  color: PropTypes.oneOf(['red', 'green', 'blue']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  small: PropTypes.bool,
  block: PropTypes.bool,
  onClick: PropTypes.func,
  linkTo: PropTypes.string
};

export default Button;
