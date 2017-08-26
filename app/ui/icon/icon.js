import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './icon.css';

import { getIsThemedIcon } from '../../selectors/game';

function Icon({ themed, theme, name }) {
  const url = themed ? `/icons/${theme}.svg` : '/icons.svg';

  return (
    <span className={styles.root} title={name}>
      <svg>
        <use xlinkHref={`${url}#${name}`}/>
      </svg>
    </span>
  );
}

Icon.propTypes = {
  themed: PropTypes.bool.isRequired,
  theme: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};

export default connect((state, props) => ({
  themed: getIsThemedIcon(state, props),
  theme: state.game.theme
}))(Icon);
