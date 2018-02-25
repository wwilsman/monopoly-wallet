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
  collapse,
  ...props
}) => {
  const className = cx('section', {
    [`align-${align}`]: !!align,
    [`justify-${justify}`]: !!justify,
    'is-collapsed': collapse,
    row
  });

  return (
    <div
        className={className}
        style={!!flex ? { flex } : null}
        {...props}/>
  );
};

Section.propTypes = {
  row: PropTypes.bool,
  collapse: PropTypes.bool,
  flex: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf(['none'])
  ]),
  align: PropTypes.oneOf(['center', 'start']),
  justify: PropTypes.oneOf(['center', 'start', 'between', 'stretch'])
};

export default Section;
