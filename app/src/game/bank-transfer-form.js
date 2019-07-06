import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import { useConfig } from '../utils';

import { Container, Section } from '../ui/layout';
import { Text } from '../ui/typography';
import { CurrencyInput, Toggle } from '../ui/forms';
import Icon from '../ui/icon';
import Button from '../ui/button';

BankTransferForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

export default function BankTransferForm({ onSubmit }) {
  let [value, setValue] = useState(null);
  let [deposit, setDeposit] = useState(false);
  let { passGoAmount, payJailAmount } = useConfig();
  let defaultValue = deposit ? payJailAmount : passGoAmount;

  let handleSubmit = useCallback((e) => {
    e.preventDefault();
    // postive numbers deposit, negative numbers withdraw
    onSubmit((value || defaultValue) * (deposit ? 1 : -1));
  }, [onSubmit, value, deposit, defaultValue]);

  return (
    <Container
      tagName="form"
      onSubmit={handleSubmit}
      align="center"
      data-test-bank-transfer-form
    >
      <Section row align="center" collapse>
        <CurrencyInput
          value={value}
          defaultValue={defaultValue}
          onChange={v => setValue(v)}
          onBlur={() => !value && setValue(null)}
          color={deposit ? 'alert' : 'secondary'}
          center
          xl
        />

        <Button type="submit" style="icon" inline>
          <Icon name="transfer" color="primary"/>
        </Button>
      </Section>

      <Section row>
        <Text
          onClick={() => setDeposit(false)}
          color={deposit ? undefined : 'secondary'}
          upper
          sm
        >
          Recieve
        </Text>

        <Toggle
          active={deposit}
          colorActive="alert"
          colorInactive="secondary"
          onChange={() => setDeposit(!deposit)}
        />

        <Text
          onClick={() => setDeposit(true)}
          color={deposit ? 'alert' : undefined}
          upper
          sm
        >
          Pay
        </Text>
      </Section>
    </Container>
  );
}
