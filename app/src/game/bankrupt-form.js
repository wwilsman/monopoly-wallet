import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

import { Container, Section } from '../ui/layout';
import Button from '../ui/button';

import PlayerSelect from './player-select';

BankruptForm.propTypes = {
  players: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default function BankruptForm({
  players,
  loading,
  onSubmit
}) {
  let beneficiaries = useMemo(() => [{ name: 'Bank', token: 'bank' }].concat(players), [players]);
  let [ beneficiary, setBeneficiary ] = useState(beneficiaries[0]);

  let handleSubmit = useCallback(e => {
    e.preventDefault();
    onSubmit(beneficiary);
  }, [onSubmit, beneficiary]);

  return (
    <Container
      tagName="form"
      onSubmit={handleSubmit}
      data-test-property-transfer-form
    >
      <Section collapse justify="center" align="center">
        <PlayerSelect
          label="Beneficiary:"
          players={beneficiaries}
          selected={beneficiary}
          onSelect={setBeneficiary}
        />
      </Section>

      <Section flex="none">
        <Button
          block
          type="submit"
          style="alert"
          loading={loading}
          disabled={loading}
        >
          Claim Bankruptcy
        </Button>
      </Section>
    </Container>
  );
}
