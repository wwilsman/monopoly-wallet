import React, { useMemo } from 'react';

import { useGame } from '../api';
import { Container, Section } from '../ui/layout';
import Icon from '../ui/icon';
import Button from '../ui/button';
import NavBar from '../ui/nav-bar';
import PlayerSummary from '../game/player-summary';
import PlayerCard from '../game/player-card';

function playerSort(players) {
  return (a, b) => {
    if (players[a].bankrupt) return 1;
    if (players[b].bankrupt) return -1;
    return players.all.indexOf(a) - players.all.indexOf(b);
  };
}

export default function DashboardScreen() {
  let { room, player, players } = useGame();

  players = useMemo(() => (
    players.all
      .filter(token => token !== player.token)
      .sort(playerSort(players))
  ), [player.token, players.all]);

  return (
    <Container
      scrollable
      data-test-dashboard
    >
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
