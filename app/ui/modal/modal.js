import React from 'react';
import PropTypes from 'prop-types';
import styles from './modal.css';

import { dataAttrs } from '../../utils';

const Modal = ({ children, ...props }) => (
  <div className={styles.container} {...dataAttrs(props)}>
    <div className={styles.modal}>
      {children}
    </div>
  </div>
);

Modal.displayName = 'Modal';

Modal.propTypes = {
  children: PropTypes.any
};

export default Modal;
