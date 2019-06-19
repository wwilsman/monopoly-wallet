import React from 'react';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';

import { Container, Section } from '../ui/layout';
import Currency from '../ui/typography/currency';

const selectPlayer = createSelector(
  ({ game }) => game ? game.players : {},
  ({ app }) => app.player && app.player.token,
  (players, token) => token && players[token]
);

export default function DashboardScreen() {
  let { balance } = useSelector(selectPlayer);

  return (
    <Container>
      <Section flex="none" collapse>
        <Currency xl center color="secondary" value={balance}/>
      </Section>
    </Container>
  );
}
