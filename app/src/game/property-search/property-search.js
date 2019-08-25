import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';

import { Container, Section } from '../../ui/layout';
import { Input } from '../../ui/forms';
import Button from '../../ui/button';
import Icon from '../../ui/icon';
import Property from '../property';
import styles from './property-search.css';

PropertySearch.propTypes = {
  properties: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      group: PropTypes.string
    })
  ).isRequired,
  onPurchase: PropTypes.func
};

export default function PropertySearch({
  properties,
  onPurchase
}) {
  let [search, setSearch] = useState('');
  let [focused, setFocused] = useState(false);

  let fuse = useMemo(() => (
    new Fuse(properties, {
      keys: ['name', 'group']
    })
  ), [properties]);

  let result = useMemo(() => {
    let res = search && fuse.search(search);
    return !!res && !!res.length && res[0];
  }, [fuse, search]);

  let handlePurchase = onPurchase && (amount => {
    if (result) onPurchase(result.id, amount);
  });

  return (
    <Container className={styles.root}>
      <Section flex="none" row collapse>
        <Input
          value={search}
          onChangeText={setSearch}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={styles.input}
          placeholder="property or group name"
          label="Search properties"
        />

        {(focused || search) && (
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
        {search ? result && (
          <Property
            property={result}
            className={styles.property}
            onPurchase={handlePurchase}
            showDetails
          />
        ) : properties.map(prop => (
          <Property
            key={prop.id}
            property={prop}
            className={styles.property}
          />
        ))}
      </Section>
    </Container>
  );
}
