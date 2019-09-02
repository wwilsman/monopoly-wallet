import React from 'react';
import PropTypes from 'prop-types';

import { useGame } from '../../api';
import { usePlayer, useProperties } from '../../helpers/hooks';

import { Section } from '../../ui/layout';
import Currency from '../../ui/typography/currency';
import Link from '../../ui/link';
import PropertiesList from '../properties-list';

import styles from './player-summary.css';

PlayerSummary.propTypes = {
  player: PropTypes.string.isRequired,
};

export default function PlayerSummary({ player }) {
  let { room } = useGame();
  let { balance } = usePlayer(player);
  let properties = useProperties(player);

  return (
    <Section flex="none" collapse data-test-summary>
      <Currency
        value={balance}
        color="secondary"
        className={styles.balance}
        data-test-player-balance
        center
        xl
      />

      <Link to={`/${room}/${player}/properties`}>
        <PropertiesList
          properties={properties}
        />
      </Link>
    </Section>
  );
}
