import React, { useCallback, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import { useGame, useEmit } from '../api';
import { usePlayer, usePlayers } from '../helpers/hooks';

import { Container, Section } from '../ui/layout';
import { Text } from '../ui/typography';
import NavBar from '../ui/nav-bar';
import Card from '../ui/card';
import Modal from '../ui/modal';

import BankruptForm from '../game/bankrupt-form';
import GameHistory from '../game/game-history';

BankScreen.propTypes = {
  push: PropTypes.func.isRequired
};

export default function BankScreen({ push }) {
  let { room, player, notice, history } = useGame();
  let players = usePlayers({ exclude: [player.token] });
  let { bankrupt: isBankrupt } = usePlayer(player.token);
  let [ showBankruptForm, toggleBankruptForm ] = useState(false);
  let [ bankrupt, bankruptResponse ] = useEmit('player:bankrupt');

  let notices = useMemo(() => (
    [notice].concat(history.map(({ notice }) => notice)).filter(Boolean)
  ), [notice, history]);

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
              Make A Transfer
            </Text>
          </Card>

          <Card linkTo={`/${room}/properties`}>
            <Text upper icon="bank">
              Purchase Properties
            </Text>
          </Card>

          <Card onClick={() => toggleBankruptForm(true)}>
            <Text upper icon="currency">
              Claim Bankruptcy
            </Text>
          </Card>
        </Section>
      )}

      <GameHistory
        player={player}
        history={notices}
      />

      {showBankruptForm && (
        <Modal
          title="Bankruptcy"
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
