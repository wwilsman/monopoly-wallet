import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './icon.css';

function Icon({ theme, name }) {
  return (
    <span className={styles.root} title={name}>
      <svg>
        <use xlinkHref={`/icons/${theme}.svg#${name}`}/>
      </svg>
    </span>
  );
}

Icon.propTypes = {
  theme: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};

export default connect(({ game }) => ({
  theme: game.theme
}))(Icon);
