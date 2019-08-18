import React from 'react';
import PropTypes from 'prop-types';

import { usePlayer, useProperties } from '../../helpers/hooks';

import { Section } from '../../ui/layout';
import Currency from '../../ui/typography/currency';
import PropertiesList from '../properties-list';

import styles from './player-summary.css';

PlayerSummary.propTypes = {
  player: PropTypes.string.isRequired,
};

export default function PlayerSummary({ player }) {
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

      <PropertiesList
        properties={properties}
      />
    </Section>
  );
}
