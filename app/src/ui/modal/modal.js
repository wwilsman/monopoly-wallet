import React from 'react';
import PropTypes from 'prop-types';

import { Container } from '../layout';
import { Text } from '../typography';
import NavBar from '../nav-bar';
import Button from '../button';
import Icon from '../icon';

import styles from './modal.css';

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  titleIcon: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

export default function Modal({
  title,
  titleIcon,
  onClose,
  children
}) {
  return (
    <>
      <div
        className={styles['modal-backdrop']}
        data-test-modal-backdrop
      />

      <Container className={styles['modal']} data-test-modal>
        <NavBar
          renderRight={() => (
            <Button style="icon" onClick={onClose} data-test-modal-close-btn>
              <Icon name="close"/>
            </Button>
          )}
        >
          <Text
            upper
            color="lighter"
            icon={titleIcon}
            data-test-modal-title
          >
            {title}
          </Text>
        </NavBar>

        {children}
      </Container>
    </>
  );
}
