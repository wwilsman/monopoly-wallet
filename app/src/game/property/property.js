import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { useGame } from '../../api';
import { useGroup } from '../../helpers/hooks';
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
    group: groupName,
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
  let {
    room,
    player,
    config: {
      mortgageRate,
      interestRate,
      groupColors
    }
  } = useGame();

  let group = useGroup(groupName, player.token);
  let isRailroad = groupName === 'railroad';
  let isUtility = groupName === 'utility';
  let isOwn = owner === player.token;
  let mortgageValue = price * mortgageRate;
  let rentAmount;

  if (isRailroad || isUtility) {
    rentAmount = rent[group.owned.length - 1];
  } else if (!buildings && monopoly) {
    rentAmount = rent[0] * 2;
  } else {
    rentAmount = rent[buildings];
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

          {isOwn && !monopoly && !mortgaged && (
            <Button
              hollow
              linkTo={`/${room}/${id}/transfer`}
              className={cx('transfer-btn')}
              data-test-property-transfer-btn
            >
              Transfer
            </Button>
          )}
        </div>
      )}

      <div
        onClick={onClick}
        className={cx('card', groupName)}
        data-test-property-group={groupName}
      >
        {(isRailroad || isUtility) && (
          <Icon
            themed
            name={isRailroad ? 'railroad' : id}
            className={cx('icon')}
          />
        )}

        <div
          className={cx('swatch')}
          style={{ backgroundColor: groupColors[groupName] }}
        >
          <Text
            upper
            className={cx('name')}
            data-test-property-name
          >
            {name}
          </Text>
        </div>

        <dl
          className={cx('content')}
          data-test-property-content
        >
          {isRailroad ? (
            <>
              <dt>Rent</dt>
              <dd><Currency value={rent[0]}/></dd>

              <dt>Rent with 2</dt>
              <dd><Currency value={rent[1]}/></dd>

              <dt>Rent with 3</dt>
              <dd><Currency value={rent[2]}/></dd>

              <dt>Rent with 4</dt>
              <dd><Currency value={rent[3]}/></dd>
            </>
          ) : isUtility ? (
            <>
              <Text className={cx('description')}>
                If one Utility is owned,<br/>
                rent is 4 times amount<br/>
                shown on dice.
              </Text>

              <Text className={cx('description')}>
                If both Utilities are owned,<br/>
                rent is 10 times amount<br/>
                shown on dice.
              </Text>
            </>
          ) : (
            <>
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
            </>
          )}

          <hr/>

          <dt>Mortgage Value</dt>
          <dd data-test-property-mortgage-value>
            <Currency value={mortgageValue}/>
          </dd>

          {!(isRailroad || isUtility) && (
            <>
              <dt>Building Cost</dt>
              <dd data-test-property-build-cost>
                <Currency value={cost}/>
              </dd>
            </>
          )}
        </dl>
      </div>

      <div className={styles.actions}>
        {owner === 'bank' && onPurchase && (
          <>
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

            <Button
              block
              hollow
              className={styles['buy-other']}
              linkTo={`/${room}/${id}/buy`}
              data-test-property-buy-other-btn
            >
              enter other amount
            </Button>
          </>
        )}
        {owner !== 'bank' && !isOwn && !mortgaged && onRent && (
          <Button
            block
            hollow
            style="alert"
            disabled={isUtility} // TODO
            onClick={() => onRent(id)}
            data-test-property-rent-btn
          >
            Pay Rent &zwj;
            {isUtility ? (
              <>(x{rentAmount})</>
            ) : (
              <>(<Currency value={rentAmount} data-test-property-rent/>)</>
            )}
          </Button>
        )}
        {isOwn && mortgaged && onUnmortgage && (
          <Button
            block
            hollow
            style="primary"
            onClick={() => onUnmortgage(id)}
            data-test-property-unmortgage-btn
          >
            Unmortgage
            (<Currency value={mortgageValue + (mortgageValue * interestRate)} data-test-property-unmortgage/>)
          </Button>
        )}
        {isOwn && !mortgaged && !buildings && onMortgage && (
          <Button
            hollow
            style="alert"
            onClick={() => onMortgage(id)}
            data-test-property-mortgage-btn
          >
            Mortgage
          </Button>
        )}
        {isOwn && !isRailroad && !isUtility && buildings > 0 && onUnimprove && (
          <Button
            hollow
            style="alert"
            onClick={() => onUnimprove(id)}
            data-test-property-unimprove-btn
          >
            Unimprove
          </Button>
        )}
        {isOwn && !isRailroad && !isUtility && monopoly && !mortgaged && buildings < 5 && onImprove && (
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
