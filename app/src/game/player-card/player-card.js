import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { useGame } from '../../api';
import { usePlayer, useProperties } from '../../helpers/hooks';

import Currency from '../../ui/typography/currency';
import Text from '../../ui/typography/text';
import PropertiesList from '../properties-list';
import Card from '../../ui/card';

import styles from './player-card.css';

const cx = classNames.bind(styles);

PlayerCard.propTypes = {
  player: PropTypes.string.isRequired,
};

export default function PlayerCard({ player }) {
  let { token, name, balance, bankrupt } = usePlayer(player);
  let properties = useProperties(player);
  let { room } = useGame();

  return (
    <Card
      className={cx({ bankrupt })}
      linkTo={!bankrupt && properties.length && `/${room}/${token}/properties`}
    >
      <div className={styles.header}>
        <Text color="light" icon={token} data-test-player-name>{name}</Text>
        <Currency color="secondary" value={balance} data-test-player-balance/>
      </div>

      <PropertiesList
        properties={properties}
        bankrupt={bankrupt}
      />
    </Card>
  );
}
