import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import Text from './text';
import Icon from '../icon';
import styles from './typography.css';

const cx = classNames.bind(styles);

Currency.propTypes = {
  value: PropTypes.number.isRequired,
  className: PropTypes.string
};

export default function Currency({ value, className, ...props }) {
  return (
    <Text className={cx('currency', className)} {...props}>
      <Icon name="currency"/>
      <span>{value.toLocaleString()}</span>
    </Text>
  );
}
