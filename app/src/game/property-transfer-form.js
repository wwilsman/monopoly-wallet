import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { Container, Section } from '../ui/layout';
import { CurrencyInput } from '../ui/forms';
import Button from '../ui/button';

import PlayerSelect from './player-select';
import Property from './property';

PropertyTransferForm.propTypes = {
  players: PropTypes.array,
  property: Property.propTypes.property,
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default function PropertyTransferForm({
  players,
  property,
  loading,
  onSubmit
}) {
  let [ price, setPrice ] = useState(null);
  let [ recipient, setRecipient ] = useState(players?.[0]);
  let isPurchasing = property.owner === 'bank';

  let handleSubmit = useCallback(e => {
    e.preventDefault();
    onSubmit((
      isPurchasing
        ? price ?? property.price
        : recipient.token
    ));
  }, [onSubmit, price, recipient]);

  return (
    <Container
      tagName="form"
      onSubmit={handleSubmit}
      data-test-property-transfer-form
    >
      <Section collapse justify="center" align="center">
        {isPurchasing ? (
          <CurrencyInput
            label="Enter amount"
            value={price}
            defaultValue={property.price}
            onChange={v => setPrice(v)}
            onBlur={() => !price && setPrice(null)}
            color="secondary"
            center
            xl
          />
        ) : (
          <PlayerSelect
            label="To:"
            players={players || []}
            selected={recipient}
            onSelect={setRecipient}
          />
        )}
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
          disabled={loading || (isPurchasing ? price === 0 : !recipient)}
        >
          {`${isPurchasing ? 'Buy' : 'Transfer'} Property`}
        </Button>
      </Section>
    </Container>
  );
}
