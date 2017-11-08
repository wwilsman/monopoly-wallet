import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './icon.css';

function Icon({ theme, name }) {
  let url = theme ? `/icons/${theme}.svg` : '/icons.svg';

  return (
    <span className={styles.root} title={name}>
      <svg>
        <use xlinkHref={`${url}#${name}`}/>
      </svg>
    </span>
  );
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  theme: PropTypes.string
};

export default connect(({ game }, props) => {
  let whitelist = game.config.playerTokens.concat(['currency', 'building']);
  let theme = whitelist.includes(props.name) && game.theme;
  return { theme };
})(Icon);
