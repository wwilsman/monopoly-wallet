import React from 'react';
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

export default Modal;
