import React, { useMemo } from 'react';

import { useApp, useGame } from '../utils';
import { Container, Section } from '../ui/layout';
import PlayerSummary from '../game/player-summary';
import PlayerCard from '../game/player-card';

export default function DashboardScreen() {
  let { player: { token } } = useApp();
  let { players } = useGame();

  players = useMemo(() => (
    players._all.filter(player => player !== token)
  ), [token, players._all]);

  return (
    <Container>
      <Section flex="none" collapse>
        <PlayerSummary player={token}/>
      </Section>

      <Section>
        {players.map(token => (
          <PlayerCard key={token} player={token}/>
        ))}
      </Section>
    </Container>
  );
}
