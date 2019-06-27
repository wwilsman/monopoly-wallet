import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { useConfig } from '../../utils';

import Icon from '../../ui/icon';
import Text from '../../ui/typography/text';

import styles from './properties-list.css';

const { entries } = Object;
const cx = classNames.bind(styles);

PropertiesList.propTypes = {
  properties: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    group: PropTypes.string.isRequired
  })).isRequired
};

export default function PropertiesList({ properties }) {
  let { groupColors } = useConfig();
  let empty = properties.length === 0;

  let groups = useMemo(() => (
    entries(groupColors).concat([['railroad'], ['utility']])
      .reduce((g, [name, color]) => {
        let p = properties.filter(({ group }) => group === name);
        return g.concat({ name, color, properties: p });
      }, [])
  ), [groupColors, properties]);

  return (
    <div className={cx('root', { 'is-empty': empty })}>
      {empty ? (
        <Text upper className={styles.message}>
          No Owned Properties
        </Text>
      ) : (
        groups.map(group => (
          <div key={group.name} className={styles.group} data-test-property-list-group>
            {group.properties.map(property => (
              <div key={property.id} className={styles.property} data-test-property={property.id}>
                {!group.color ? (
                  <Icon
                    name={property.group === 'railroad' ? 'railroad' : property.id}
                    className={styles.icon}
                    themed
                  />
                ) : (
                  <div
                    className={styles.swatch}
                    style={{ backgroundColor: group.color }}
                    data-test-property-swatch={group.name}
                  />
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
