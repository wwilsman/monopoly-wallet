import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './token-select.css';

import { useDataAttrs } from '../../helpers/hooks';

import RadioGroup from '../../ui/forms/radio-group';
import Icon from '../../ui/icon';

const cx = classNames.bind(styles);

TokenSelectItem.propTypes = {
  name: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  disabled: PropTypes.bool
};

function TokenSelectItem({
  name,
  selected,
  disabled,
  ...props
}) {
  let className = cx('token', {
    'is-selected': selected,
    'is-disabled': disabled
  });

  return (
    <div className={className} {...props}>
      <Icon name={name}/>
    </div>
  );
}

TokenSelect.propTypes = {
  tokens: PropTypes.arrayOf(PropTypes.string).isRequired,
  disabled: PropTypes.arrayOf(PropTypes.string).isRequired,
  selected: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  disableAll: PropTypes.bool
};

export default function TokenSelect({
  tokens,
  selected,
  disabled,
  disableAll,
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
      disabled={disabled.map((t) => tokens.indexOf(t))}
      disableAll={disableAll}
      onSelect={onSelect}
      renderItem={(token, attrs) => (
        <TokenSelectItem name={token} {...attrs}/>
      )}
      {...useDataAttrs(props)}
    />
  );
}
