import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { useConfig } from '../helpers/hooks';

import { Container, Section } from '../ui/layout';
import { CurrencyInput, Toggle } from '../ui/forms';
import Button from '../ui/button';

import PlayerSelect from './player-select';

TransferForm.propTypes = {
  loading: PropTypes.bool.isRequired,
  players: PlayerSelect.propTypes.players,
  onSubmit: PropTypes.func.isRequired
};

export default function TransferForm({
  players,
  loading,
  onSubmit
}) {
  let { passGoAmount, payJailAmount } = useConfig();
  let recipients = useMemo(() => [{ name: 'Bank', token: 'bank' }].concat(players), [players]);

  let [ recipient, setRecipient ] = useState(() => recipients[0]);
  let [ value, setValue ] = useState(null);
  let [ pay, setPay ] = useState(false);

  let defaultValue = recipient.token === 'bank' ? (pay ? payJailAmount : passGoAmount) : 0;
  pay = recipient.token !== 'bank' || pay;

  let handleSubmit = useCallback(e => {
    e.preventDefault();
    // postive numbers pay, negative numbers take
    let amount = (value ?? defaultValue) * (pay ? 1 : -1);
    onSubmit(recipient.token, amount);
  }, [onSubmit, value, pay, defaultValue]);

  return (
    <Container
      tagName="form"
      onSubmit={handleSubmit}
      data-test-bank-transfer-form
    >
      <Section collapse justify="center" align="center">
        <CurrencyInput
          value={value}
          defaultValue={defaultValue}
          onChange={v => setValue(v)}
          onBlur={() => !value && setValue(null)}
          color={pay ? 'alert' : 'secondary'}
          center
          xl
        />

        <Section flex="none" row>
          <Toggle
            active={pay}
            labelActive="Pay"
            labelInactive="Take"
            colorActive="alert"
            colorInactive="secondary"
            disabled={recipient.token !== 'bank'}
            onChange={() => setPay(!pay)}
          />
        </Section>
      </Section>

      <Section row collapse flex={2}>
        <PlayerSelect
          label={pay ? 'To:' : 'From:'}
          players={players.length ? recipients : players}
          selected={recipient}
          onSelect={setRecipient}
        />
      </Section>

      <Section flex="none">
        <Button
          block
          type="submit"
          style={pay ? 'alert' : 'secondary'}
          loading={loading}
          disabled={loading || !(value ?? defaultValue)}
          data-test-join-game-btn
        >
          {pay ? 'Pay' : 'Withdraw'}
        </Button>
      </Section>
    </Container>
  );
}
