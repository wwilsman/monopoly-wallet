import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useGame, useEmit } from '../api';
import { Container, Section } from '../ui/layout';
import { Text, Heading } from '../ui/typography';
import NavBar from '../ui/nav-bar';
import BankTransferForm from '../game/bank-transfer-form';

BankScreen.propTypes = {
  push: PropTypes.func.isRequired
};

export default function BankScreen({ push }) {
  let [ transfer, { pending, ok }] = useEmit('player:transfer');
  let { room } = useGame();

  let handleBankTransfer = useCallback(amount => {
    if (!pending) transfer('bank', amount);
  }, [pending]);

  useEffect(() => ok && push(`/${room}`), [ok]);

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
