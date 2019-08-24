import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { useConfig } from '../../helpers/hooks';
import { Text, Currency } from '../../ui/typography';
import Icon from '../../ui/icon';
import Button from '../../ui/button';

import styles from './property.css';

const cx = classNames.bind(styles);

Property.propTypes = {
  property: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    group: PropTypes.string.isRequired,
    rent: PropTypes.arrayOf(PropTypes.number).isRequired,
    price: PropTypes.number.isRequired,
    cost: PropTypes.number.isRequired,
    owner: PropTypes.string.isRequired
  }).isRequired,
  showDetails: PropTypes.bool,
  onPurchase: PropTypes.func,
  className: PropTypes.string
};

export default function Property({
  property,
  showDetails,
  onPurchase,
  className
}) {
  let { id, name, group, rent, price, cost, owner } = property;
  let { mortgageRate, groupColors } = useConfig();

  // TODO: implement these
  if (group === 'railroad' || group === 'utility') {
    return null;
  }

  return (
    <div
      className={cx('root', className)}
      data-test-property={id}
    >
      {showDetails && (
        <div className={cx('info')}>
          {owner === 'bank' && (
            <Currency value={price}/>
          )}
        </div>
      )}

      <div
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
            <Icon name="building" className={cx('hotel')}/>
          </dt>
          <dd>
            <Currency value={rent[4]}/>
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

      {showDetails && (
        <div className={cx('actions')}>
          {onPurchase && (
            <Button
              style="primary"
              onClick={onPurchase}
              data-test-property-buy-btn
            >
              Purchase
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
