import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { useApp } from '../utils';
import { usePlayerActions } from '../redux/actions';

import { Container, Section } from '../ui/layout';
import { Text, Heading } from '../ui/typography';
import NavBar from '../ui/nav-bar';
import BankTransferForm from '../game/bank-transfer-form';

BankScreen.propTypes = {
  push: PropTypes.func.isRequired
};

export default function BankScreen({ push }) {
  let { room } = useApp();
  let { makeTransfer } = usePlayerActions();

  let handleBankTransfer = useCallback((amount) => {
    makeTransfer(amount);
    // TODO: wait for transfer finish
    push(`/${room}`);
  }, [makeTransfer, push, room]);

  return (
    <Container data-test-bank>
      <NavBar
        showBack={`/${room}`}
        roomCode={room}
      >
        <Text
          upper
          icon="bank"
          color="lighter"
          data-test-player-name
        >
          Bank
        </Text>
      </NavBar>

      <Section flex="none" collapse>
        <Heading h2>
          Transfer
        </Heading>

        <BankTransferForm
          onSubmit={handleBankTransfer}
        />
      </Section>
    </Container>
  );
}
