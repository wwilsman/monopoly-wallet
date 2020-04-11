import React, { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useGame, useEmit } from '../api';
import { usePlayer, usePlayers } from '../helpers/hooks';

import { Container, Section } from '../ui/layout';
import { Text } from '../ui/typography';
import NavBar from '../ui/nav-bar';
import Card from '../ui/card';
import Modal from '../ui/modal';

import BankruptForm from '../game/bankrupt-form';

BankScreen.propTypes = {
  push: PropTypes.func.isRequired
};

export default function BankScreen({ push }) {
  let { room, player } = useGame();
  let players = usePlayers({ exclude: [player.token] });
  let { bankrupt: isBankrupt } = usePlayer(player.token);
  let [ showBankruptForm, toggleBankruptForm ] = useState(false);
  let [ bankrupt, bankruptResponse ] = useEmit('player:bankrupt');

  let handleBankrupt = useCallback(beneficiary => {
    if (!bankruptResponse.pending) bankrupt(beneficiary.token);
  }, [bankruptResponse.pending, bankrupt]);

  useEffect(() => {
    if (bankruptResponse.ok) push(`/${room}`);
  }, [bankruptResponse.ok]);

  return (
    <Container
      scrollable
      data-test-bank
    >
      <NavBar
        title="Bank"
        titleIcon="bank"
        showBack={`/${room}`}
        roomCode={room}
      />

      {!isBankrupt && (
        <Section flex="none">
          <Card linkTo={`/${room}/transfer`}>
            <Text upper icon="transfer">
              Transfer
            </Text>
          </Card>

          <Card linkTo={`/${room}/properties`}>
            <Text upper icon="bank">
              Properties
            </Text>
          </Card>

          <Card onClick={() => toggleBankruptForm(true)}>
            <Text upper icon="currency">
              Bankrupt
            </Text>
          </Card>
        </Section>
      )}

      {showBankruptForm && (
        <Modal
          title="Bankrupt"
          titleIcon="currency"
          onClose={() => toggleBankruptForm(false)}
        >
          <BankruptForm
            players={players}
            loading={bankruptResponse.pending}
            onSubmit={handleBankrupt}
          />
        </Modal>
      )}
    </Container>
  );
}
