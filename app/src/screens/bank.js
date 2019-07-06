import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { useApp, useWaitingFor, usePrevious } from '../utils';
import { usePlayerActions } from '../redux/actions';

import { Container, Section } from '../ui/layout';
import { Text, Heading } from '../ui/typography';
import NavBar from '../ui/nav-bar';
import BankTransferForm from '../game/bank-transfer-form';

BankScreen.propTypes = {
  push: PropTypes.func.isRequired
};

export default function BankScreen({ push }) {
  let waiting = useWaitingFor('game:update');
  let wasWaiting = usePrevious(waiting);
  let { makeTransfer } = usePlayerActions();
  let { room } = useApp();

  let handleBankTransfer = useCallback((amount) => {
    makeTransfer(amount);
  }, [makeTransfer]);

  // go to dashboard after transferring
  if (wasWaiting & !waiting) {
    push(`/${room}`);
  }

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
        <Heading h2 data-test-bank-heading>
          Transfer
        </Heading>

        <BankTransferForm
          onSubmit={handleBankTransfer}
        />
      </Section>
    </Container>
  );
}
