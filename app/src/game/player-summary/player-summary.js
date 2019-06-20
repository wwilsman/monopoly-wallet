import React from 'react';
import PropTypes from 'prop-types';

import { usePlayer, useProperties } from '../../utils';

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
    <>
      <Currency
        value={balance}
        color="secondary"
        className={styles.balance}
        center
        xl
      />

      <PropertiesList
        properties={properties}
      />
    </>
  );
}
