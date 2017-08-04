import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './layout.css';

const cx = classNames.bind(styles);

const Container = ({
  row,
  align,
  justify,
  tagName,
  ...props
}) => {
  const Component = tagName || 'div';
  const className = cx('container', {
    'row': !!row,
    [`align-${align}`]: !!align,
    [`justify-${justify}`]: !!justify
  });

  return (
    <Component className={className} {...props}/>
  );
};

Container.propTypes = {
  row: PropTypes.bool,
  align: PropTypes.oneOf(['center', 'start']),
  justify: PropTypes.oneOf(['center', 'start', 'between', 'stretch']),
  tagName: PropTypes.string
};

export default Container;
