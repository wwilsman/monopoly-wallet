import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './layout.css';

const cx = classNames.bind(styles);

const Section = ({
  row,
  flex,
  align,
  justify,
  ...props
}) => {
  const className = cx('section', {
    'row': !!row,
    [`align-${align}`]: !!align,
    [`justify-${justify}`]: !!justify
  });

  return (
    <div
        className={className}
        style={flex !== undefined ? { flex } : null}
        {...props}/>
  );
};

Section.propTypes = {
  row: PropTypes.bool,
  flex: PropTypes.number,
  align: PropTypes.oneOf(['center', 'start']),
  justify: PropTypes.oneOf(['center', 'start', 'between', 'stretch'])
};

export default Section;
