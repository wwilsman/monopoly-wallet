import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import styles from './icon.css';

const cx = classNames.bind(styles);

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  themed: PropTypes.bool,
  className: PropTypes.string
};

export default function Icon({ name, themed, className, ...props }) {
  let url = useSelector(({ app: { theme }, config: { playerTokens } }) => {
    let whitelist = (playerTokens || []).concat(['currency', 'building']);
    return (theme && (themed || whitelist.includes(name))) ? `/icons/${theme}.svg` : '/icons.svg';
  });

  return (
    <span title={name} className={cx('root', className)} {...props}>
      <svg>
        <use xlinkHref={`${url}#${name}`}/>
      </svg>
    </span>
  );
}
