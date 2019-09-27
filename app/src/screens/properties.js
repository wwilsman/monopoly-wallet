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
  let [ improveProperty, improveResponse ] = useEmit('property:improve');
  let [ unimproveProperty, unimproveResponse ] = useEmit('property:unimprove');
  let [ mortgageProperty, mortgageResponse ] = useEmit('property:mortgage');
  let [ unmortgageProperty, unmortgageResponse ] = useEmit('property:unmortgage');
  let player = usePlayer(params.token);
  let { room } = useGame();

  let handlePurchase = useCallback((id, amount) => {
    if (!buyResponse.pending) buyProperty(id, amount);
  }, [buyResponse.pending, buyProperty]);

  let handleRent = useCallback((id, amount) => {
    if (!rentResponse.pending) rentProperty(id, amount);
  }, [rentResponse.pending, rentProperty]);

  let handleImprove = useCallback(id => {
    if (!improveResponse.pending) improveProperty(id);
  }, [improveResponse.pending, improveProperty]);

  let handleUnimprove = useCallback(id => {
    if (!unimproveResponse.pending) unimproveProperty(id);
  }, [unimproveResponse.pending, unimproveProperty]);

  let handleMortgage = useCallback(id => {
    if (!mortgageResponse.pending) mortgageProperty(id);
  }, [mortgageResponse.pending, mortgageProperty]);

  let handleUnmortgage = useCallback(id => {
    if (!unmortgageResponse.pending) unmortgageProperty(id);
  }, [unmortgageResponse.pending, unmortgageProperty]);

  useEffect(() => {
    if (buyResponse.ok || rentResponse.ok) push(`/${room}`);
  }, [buyResponse.ok, rentResponse.ok]);

  return (
    <Container data-test-properties-search>
      <NavBar
        showBack={`/${room}${player.token ? '' : '/bank'}`}
        roomCode={room}
      >
        <Text
          upper
          color="lighter"
          icon={player.token ?? 'bank'}
          data-test-screen-title
        >
          {player.name ?? 'Properties'}
        </Text>
      </NavBar>

      <PropertySearch
        player={player}
        onPurchase={handlePurchase}
        onRent={handleRent}
        onImprove={handleImprove}
        onUnimprove={handleUnimprove}
        onMortgage={handleMortgage}
        onUnmortgage={handleUnmortgage}
      />
    </Container>
  );
}
