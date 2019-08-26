import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useGame, useEmit } from '../api';
import { usePlayer } from '../helpers/hooks';

import { Container } from '../ui/layout';
import { Text } from '../ui/typography';
import NavBar from '../ui/nav-bar';
import PropertySearch from '../game/property-search';

PropertiesScreen.propTypes = {
  push: PropTypes.func.isRequired,
  params: PropTypes.shape({
    token: PropTypes.string
  })
};

export default function PropertiesScreen({ push, params }) {
  let [ buyProperty, buyResponse ] = useEmit('property:buy');
  let [ rentProperty, rentResponse ] = useEmit('property:rent');
  let player = usePlayer(params.token);
  let { room } = useGame();

  let handlePurchase = useCallback((id, amount) => {
    if (!buyResponse.pending) buyProperty(id, amount);
  }, [buyProperty]);

  let handleRent = useCallback((id, amount) => {
    if (!rentResponse.pending) rentProperty(id, amount);
  }, [rentProperty]);

  useEffect(() => {
    if (buyResponse.ok || rentResponse.ok) {
      push(`/${room}`);
    }
  }, [buyResponse.ok, rentResponse.ok]);

  return (
    <Container data-test-properties-search>
      <NavBar
        showBack={`/${room}/bank`}
        roomCode={room}
      >
        <Text
          upper
          color="lighter"
          icon={player?.token ?? 'bank'}
          data-test-screen-title
        >
          {player?.name ?? 'Properties'}
        </Text>
      </NavBar>

      <PropertySearch
        player={player}
        onPurchase={handlePurchase}
        onRent={handleRent}
      />
    </Container>
  );
}
