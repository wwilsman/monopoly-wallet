import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './typography.css';

const cx = classNames.bind(styles);

Heading.propTypes = {
  h2: PropTypes.bool,
  className: PropTypes.string
};

export default function Heading({ h2, className, ...props }) {
  let TagName = h2 ? 'h2' : 'h1';

  return (
    <TagName className={cx('heading', className)} {...props}/>
  );
}
