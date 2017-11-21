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
  theme: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool
  ]).isRequired
};

export default connect(({ app, config }, props) => {
  let tokens = config.playerTokens || [];
  let whitelist = tokens.concat(['currency', 'building']);
  let theme = whitelist.includes(props.name) && app.theme;
  return { theme };
})(Icon);
