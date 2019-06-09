import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styles from './icon.css';

Icon.propTypes = {
  name: PropTypes.string.isRequired
};

export default function Icon({ name }) {
  let url = useSelector(({ app: { theme }, config: { playerTokens } }) => {
    let whitelist = (playerTokens || []).concat(['currency', 'building']);
    return (theme && whitelist.includes(name)) ? `/icons/${theme}.svg` : '/icons.svg';
  });

  return (
    <span className={styles.root} title={name}>
      <svg>
        <use xlinkHref={`${url}#${name}`}/>
      </svg>
    </span>
  );
}
