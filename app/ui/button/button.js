import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './button.css';

const cx = classNames.bind(styles);

const Button = ({
  color,
  disabled,
  onClick,
  linkTo,
  ...props
}) => {
  const className = cx('button', {
    'is-disabled': disabled,
    [color]: !!color
  });

  return linkTo ? (
    <Link
        to={linkTo}
        className={className}
        {...props}/>
  ) : (
    <button
        className={className}
        onClick={!disabled && onClick}
        {...props}/>
  );
};

export default Button;
