import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { Container, Section } from '../ui/layout';
import { CurrencyInput } from '../ui/forms';
import Button from '../ui/button';

import Property from './property';

PropertyTransferForm.propTypes = {
  loading: PropTypes.bool.isRequired,
  property: Property.propTypes.property,
  onSubmit: PropTypes.func.isRequired
};

export default function PropertyTransferForm({
  property,
  loading,
  onSubmit
}) {
  let [ value, setValue ] = useState(null);

  let handleSubmit = useCallback(e => {
    e.preventDefault();
    onSubmit(value ?? property.price);
  }, [onSubmit, value]);

  return (
    <Container
      tagName="form"
      onSubmit={handleSubmit}
      data-test-property-transfer-form
    >
      <Section collapse justify="center" align="center">
        <CurrencyInput
          label="Enter amount"
          value={value}
          defaultValue={property.price}
          onChange={v => setValue(v)}
          onBlur={() => !value && setValue(null)}
          color="secondary"
          center
          xl
        />
      </Section>

      <Section row flex={4}>
        <Property property={property} />
      </Section>

      <Section flex="none">
        <Button
          block
          type="submit"
          style="primary"
          loading={loading}
          disabled={loading || value === 0}
          data-test-join-game-btn
        >
          Buy Property
        </Button>
      </Section>
    </Container>
  );
}
