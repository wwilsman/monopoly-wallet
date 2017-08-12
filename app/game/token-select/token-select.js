import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './token-select.css';

import { dataAttrs } from '../../utils';

import RadioGroup from '../../ui/forms/radio-group';
import Icon from '../../ui/icon';

const cx = classNames.bind(styles);

function TokenSelectItem({
  name,
  selected,
  disabled,
  ...props
}) {
  const className = cx('token', {
    'is-selected': selected,
    'is-disabled': disabled
  });

  return (
    <div className={className} {...props}>
      <Icon name={name}/>
    </div>
  );
}

TokenSelectItem.propTypes = {
  name: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  disabled: PropTypes.bool
};

function TokenSelect({
  tokens,
  selected,
  onSelect,
  ...props
}) {
  return (
    <RadioGroup
        className={styles.root}
        itemClassName={styles.item}
        label="Select a token"
        data={tokens}
        selected={tokens.indexOf(selected)}
        onSelect={onSelect}
        renderItem={(token, attrs) => (
          <TokenSelectItem name={token} {...attrs}/>
        )}
        {...dataAttrs(props)}/>
  );
}

TokenSelect.propTypes = {
  tokens: PropTypes.arrayOf(PropTypes.string).isRequired,
  selected: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default TokenSelect;
