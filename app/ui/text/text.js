import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './text.css';

const cx = classNames.bind(styles);

const Text = ({
  h1,
  center,
  ...props
}) => {
  const Tag = h1 ? 'h1' : 'span';
  const className = cx({ center });

  return (
    <Tag className={className} {...props}/>
  );
};

Text.propTypes = {
  h1: PropTypes.bool,
  center: PropTypes.bool
};

export default Text;
