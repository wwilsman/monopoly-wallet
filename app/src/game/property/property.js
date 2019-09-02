import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { useGame } from '../../api';
import { Text, Currency } from '../../ui/typography';
import Icon from '../../ui/icon';
import Button from '../../ui/button';

import styles from './property.css';

const cx = classNames.bind(styles);

Property.propTypes = {
  className: PropTypes.string,
  property: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    group: PropTypes.string.isRequired,
    rent: PropTypes.arrayOf(PropTypes.number).isRequired,
    monopoly: PropTypes.bool.isRequired,
    mortgaged: PropTypes.bool.isRequired,
    buildings: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    cost: PropTypes.number.isRequired,
    owner: PropTypes.string.isRequired
  }).isRequired,
  showDetails: PropTypes.bool,
  onClick: PropTypes.func,
  onPurchase: PropTypes.func,
  onRent: PropTypes.func,
  onImprove: PropTypes.func,
  onUnimprove: PropTypes.func,
  onMortgage: PropTypes.func,
  onUnmortgage: PropTypes.func
};

export default function Property({
  className,
  property: {
    id,
    name,
    group,
    rent,
    monopoly,
    mortgaged,
    buildings,
    price,
    cost,
    owner
  },
  showDetails,
  onClick,
  onPurchase,
  onRent,
  onImprove,
  onUnimprove,
  onMortgage,
  onUnmortgage
}) {
  let { player, config: { mortgageRate, groupColors } } = useGame();
  let rentAmount = (!buildings && monopoly) ? rent[0] * 2 : rent[buildings];
  let isOwn = owner === player.token;

  // TODO: implement these
  if (group === 'railroad' || group === 'utility') {
    return null;
  }

  return (
    <div
      className={cx('root', {
        'is-mortgaged': showDetails && mortgaged
      }, className)}
      data-test-property={id}
    >
      {showDetails && (
        <div className={styles.details}>
          {mortgaged && (
            <Text upper color="alert" data-test-property-mortgaged>
              Mortgaged
            </Text>
          )}

          {buildings === 5 ? (
            <Icon name="building" className={cx('hotel')} data-test-property-hotel/>
          ) : Array(buildings).fill().map((_, i) => (
            <Icon name="building" className={cx('house')} key={i} data-test-property-house/>
          ))}
        </div>
      )}

      <div
        onClick={onClick}
        className={cx('card', group)}
        data-test-property-group={group}
      >
        <div
          className={cx('swatch')}
          style={{ backgroundColor: groupColors[group] }}
        >
          <Text upper data-test-property-name>
            {name}
          </Text>
        </div>

        <dl
          className={cx('content')}
          data-test-property-content
        >
          <dt>Rent</dt>
          <dd><Currency value={rent[0]}/></dd>

          <dt>Rent with Monopoly</dt>
          <dd><Currency value={rent[0] * 2}/></dd>

          <dt>
            {'Rent with '}
            <Icon name="building" className={cx('house')}/>
          </dt>
          <dd>
            <Currency value={rent[1]}/>
          </dd>

          <dt>
            {'Rent with '}
            <Icon name="building" className={cx('house')}/>
            <Icon name="building" className={cx('house')}/>
          </dt>
          <dd>
            <Currency value={rent[2]}/>
          </dd>

          <dt>
            {'Rent with '}
            <Icon name="building" className={cx('house')}/>
            <Icon name="building" className={cx('house')}/>
            <Icon name="building" className={cx('house')}/>
          </dt>
          <dd>
            <Currency value={rent[3]}/>
          </dd>

          <dt>
            {'Rent with '}
            <Icon name="building" className={cx('house')}/>
            <Icon name="building" className={cx('house')}/>
            <Icon name="building" className={cx('house')}/>
            <Icon name="building" className={cx('house')}/>
          </dt>
          <dd>
            <Currency value={rent[4]}/>
          </dd>

          <dt>
            {'Rent with '}
            <Icon name="building" className={cx('hotel')}/>
          </dt>
          <dd>
            <Currency value={rent[5]}/>
          </dd>

          <hr/>

          <dt>Mortgage Value</dt>
          <dd data-test-property-mortgage-value>
            <Currency value={price * mortgageRate}/>
          </dd>

          <dt>Building Cost</dt>
          <dd data-test-property-build-cost>
            <Currency value={cost}/>
          </dd>
        </dl>
      </div>

      <div className={styles.actions}>
        {owner === 'bank' && onPurchase && (
          <Button
            block
            hollow
            style="primary"
            onClick={() => onPurchase(id, price)}
            data-test-property-buy-btn
          >
            Buy for &zwj;
            <Currency value={price} data-test-property-price/>
          </Button>
        )}
        {owner !== 'bank' && !isOwn && !mortgaged && onRent && (
          <Button
            block
            hollow
            style="alert"
            onClick={() => onRent(id, rentAmount)}
            data-test-property-rent-btn
          >
            Pay Rent
            (<Currency value={rentAmount} data-test-property-rent/>)
          </Button>
        )}
        {isOwn && mortgaged && onUnmortgage && (
          <Button
            hollow
            style="secondary"
            onClick={() => onUnmortgage(id)}
            data-test-property-improve-btn
          >
            Unmortgage
          </Button>
        )}
        {isOwn && !mortgaged && !buildings && onMortgage && (
          <Button
            hollow
            style="alert"
            onClick={() => onMortgage(id)}
            data-test-property-improve-btn
          >
            Mortgage
          </Button>
        )}
        {isOwn && buildings > 1 && onUnimprove && (
          <Button
            hollow
            style="alert"
            onClick={() => onUnimprove(id)}
            data-test-property-unimprove-btn
          >
            Unimprove
          </Button>
        )}
        {isOwn && monopoly && buildings < 5 && onImprove && (
          <Button
            hollow
            style="secondary"
            onClick={() => onImprove(id)}
            data-test-property-improve-btn
          >
            Improve
          </Button>
        )}
      </div>
    </div>
  );
}
