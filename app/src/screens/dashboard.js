import React, { useMemo } from 'react';

import { useGame } from '../api';
import { Container, Section } from '../ui/layout';
import Icon from '../ui/icon';
import Button from '../ui/button';
import NavBar from '../ui/nav-bar';
import PlayerSummary from '../game/player-summary';
import PlayerCard from '../game/player-card';

export default function DashboardScreen() {
  let { room, player, players } = useGame();

  players = useMemo(() => (
    players.all.filter(token => token !== player.token)
  ), [player.token, players.all]);

  return (
    <Container data-test-dashboard>
      <NavBar
        title={player.name}
        titleIcon={player.token}
        roomCode={room}
        renderLeft={() => (
          <Button
            style="icon"
            linkTo={`/${room}/bank`}
            data-test-bank-btn
          >
            <Icon name="bank"/>
          </Button>
        )}
      />

      <PlayerSummary
        player={player.token}
      />

      <Section>
        {players.map(token => (
          <PlayerCard
            key={token}
            player={token}
          />
        ))}
      </Section>
    </Container>
  );
}
