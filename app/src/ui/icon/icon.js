import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import styles from './icon.css';

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
  let url = useSelector(({ app: { theme }, config: { playerTokens } }) => {
    let whitelist = (playerTokens || []).concat(['currency', 'building', 'bank']);
    return (theme && (themed || whitelist.includes(name))) ? `/icons/${theme}.svg` : '/icons.svg';
  });

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
