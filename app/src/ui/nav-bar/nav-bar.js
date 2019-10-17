import React from 'react';
import PropTypes from 'prop-types';

import { useRouter } from '../../router';

import { Section } from '../layout';
import { Text } from '../typography';
import Button from '../button';
import Icon from '../icon';

import styles from './nav-bar.css';

NavBar.propTypes = {
  showBack: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string
  ]),
  roomCode: PropTypes.string,
  renderLeft: PropTypes.func,
  renderRight: PropTypes.func,
  title: PropTypes.string,
  titleIcon: PropTypes.string,
  children: PropTypes.node
};

export default function NavBar({
  showBack,
  roomCode,
  renderLeft,
  renderRight,
  title,
  titleIcon,
  children
}) {
  let { location, goBack } = useRouter();

  return (
    <Section flex="none" row>
      <div className={styles['left']}>
        {renderLeft ? renderLeft() : (showBack && location.state?.internal ? (
          <Button style="icon" onClick={goBack} data-test-back>
            <Icon name="larr"/>
          </Button>
        ) : typeof showBack === 'string' ? (
          <Button style="icon" linkTo={showBack} data-test-back>
            <Icon name="larr"/>
          </Button>
        ) : null)}
      </div>

      {children || (
        <Text
          upper
          color="lighter"
          icon={titleIcon}
          data-test-nav-title
        >
          {title}
        </Text>
      )}

      <div className={styles['right']}>
        {renderRight ? renderRight() : (!!roomCode && (
          <Text sm upper color="secondary" data-test-room-code>
            {roomCode}
          </Text>
        ))}
      </div>
    </Section>
  );
}
