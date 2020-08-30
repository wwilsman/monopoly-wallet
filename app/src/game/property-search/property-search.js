import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Fuse from 'fuse.js';

import { useProperties } from '../../helpers/hooks';

import { Section } from '../../ui/layout';
import { Text } from '../../ui/typography';
import { Input } from '../../ui/forms';
import Button from '../../ui/button';
import Icon from '../../ui/icon';
import Property from '../property';
import styles from './property-search.css';

const cx = classNames.bind(styles);

PropertySearch.propTypes = {
  player: PropTypes.shape({
    token: PropTypes.string
  }),
  hideActions: PropTypes.bool,
  onPurchase: PropTypes.func,
  onRent: PropTypes.func,
  onImprove: PropTypes.func,
  onUnimprove: PropTypes.func,
  onMortgage: PropTypes.func,
  onUnmortgage: PropTypes.func
};

export default function PropertySearch({
  player,
  hideActions,
  onPurchase,
  onRent,
  onImprove,
  onUnimprove,
  onMortgage,
  onUnmortgage
}) {
  let [ search, setSearch ] = useState('');
  let [ focused, setFocused ] = useState(false);
  let properties = useProperties(player?.token ?? 'bank');

  let fuse = useMemo(() => (
    new Fuse(properties, {
      keys: ['name', 'group']
    })
  ), [properties]);

  let result = useMemo(() => (
    !!search && fuse.search(search)?.[0]?.item
  ), [fuse, search]);

  if (properties.length === 1) {
    [result] = properties;
    search = result.name;
  }

  return properties.length === 0 ? (
    <Section justify="center">
      <Text
        upper
        color="darker"
        className={styles['not-found']}
        data-test-property-empty
      >
        No owned properties
      </Text>
    </Section>
  ) : (
    <Section className={cx('root', { 'list-view': !result })}>
      <Section flex="none" row collapse>
        <Input
          value={search}
          onChangeText={setSearch}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={styles.input}
          disabled={properties.length <= 1}
          placeholder="property or group name"
          label="Search properties"
          data-test-property-search-input
        />

        {(focused || search) && properties.length > 1 && (
          <Button
            inline
            style="icon"
            onClick={() => setSearch('')}
            data-test-property-search-clear
          >
            <Icon color="alert" name="close"/>
          </Button>
        )}
      </Section>

      <Section justify="center">
        {search ? (
          result ? (
            <Property
              property={result}
              className={styles.property}
              onPurchase={onPurchase}
              onRent={onRent}
              onImprove={onImprove}
              onUnimprove={onUnimprove}
              onMortgage={onMortgage}
              onUnmortgage={onUnmortgage}
              hideActions={hideActions}
              showDetails
            />
          ) : (
            <Text
              upper
              color="darker"
              className={styles['not-found']}
              data-test-property-not-found
            >
              {'No matching'}<br/>{'properties'}
            </Text>
          )
        ) : properties.map(prop => (
          <Property
            key={prop.id}
            property={prop}
            className={styles.property}
            onClick={() => setSearch(prop.name)}
          />
        ))}
      </Section>
    </Section>
  );
}
