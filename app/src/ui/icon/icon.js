import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './icon.css';

import { useGame } from '../../api';

const cx = classNames.bind(styles);

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  themed: PropTypes.bool,
  color: PropTypes.oneOf(['primary', 'secondary', 'alert']),
  className: PropTypes.string
};

export default function Icon({
  name,
  themed,
  color,
  className,
  ...props
}) {
  let { theme, config: { playerTokens = [] } = {} } = useGame();

  let url = useMemo(() => {
    let whitelist = playerTokens.concat(['currency', 'building', 'bank']);
    return (theme && (themed || whitelist.includes(name))) ? `/icons/${theme}.svg` : '/icons.svg';
  }, [name, themed, theme, playerTokens]);

  return (
    <span
      title={name}
      className={cx('root', {
        [`color--${color}`]: !!color
      }, className)}
      {...props}
    >
      <svg>
        <use xlinkHref={`${url}#${name}`}/>
      </svg>
    </span>
  );
}
