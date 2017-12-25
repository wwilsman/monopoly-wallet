import React from 'react';
import PropTypes from 'prop-types';

import Text from './text';
import Icon from '../icon';

function Currency({ value, ...props }) {
  return (
    <Text {...props}>
      <Icon name="currency"/>
      <span>{value.toLocaleString()}</span>
    </Text>
  );
}

Currency.propTypes = {
  value: PropTypes.number.isRequired
};

export default Currency;
