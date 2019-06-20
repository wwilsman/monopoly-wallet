import React from 'react';
import PropTypes from 'prop-types';

import { usePlayer, useProperties } from '../../utils';

import Currency from '../../ui/typography/currency';
import Text from '../../ui/typography/text';
import PropertiesList from '../properties-list';

import styles from './player-card.css';

PlayerCard.propTypes = {
  player: PropTypes.string.isRequired,
};

export default function PlayerCard({ player }) {
  let { token, name, balance } = usePlayer(player);
  let properties = useProperties(player);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Text color="light" icon={token}>{name}</Text>
        <Currency color="secondary" value={balance}/>
      </div>

      <PropertiesList properties={properties}/>
    </div>
  );
}
