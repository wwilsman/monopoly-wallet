import React from 'react';
import PropTypes from 'prop-types';

import { useOwnNameFormatter } from '../helpers/hooks';

import Section from '../ui/layout/section';
import Text from '../ui/typography/text';

import Toast from '../ui/toaster/toast';

GameHistory.propTypes = {
  player: PropTypes.shape({
    token: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }),
  history: PropTypes.arrayOf(PropTypes.shape({
    message: PropTypes.string.isRequired,
    meta: PropTypes.shape({
      player: PropTypes.string
    })
  })).isRequired
};

export default function GameHistory({
  player,
  history
}) {
  let format = useOwnNameFormatter();

  return history.length ? (
    <Section data-test-game-history>
      <Text center upper sm>
        History
      </Text>

      <Section>
        {history.map(({ message, meta }, i) => (
          <Toast
            key={i}
            type={meta?.player === player.token ? 'message' : 'default'}
            message={format(message)}
          />
        ))}
      </Section>
    </Section>
  ) : null;
}
