import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './layout.css';

const cx = classNames.bind(styles);

const Container = ({
  row,
  align,
  justify,
  ...props
}) => {
  const className = cx('container', {
    [`align-${align}`]: !!align,
    [`justify-${justify}`]: !!justify
  });

  return (
    <div className={className} {...props}/>
  );
};

Container.propTypes = {
  row: PropTypes.bool,
  align: PropTypes.oneOf(['center', 'start']),
  justify: PropTypes.oneOf(['center', 'start', 'between', 'stretch'])
};

export default Container;
