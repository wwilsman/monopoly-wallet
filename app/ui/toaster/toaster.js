import React, { Component} from 'react';
import PropTypes from 'prop-types';
import styles from './toaster.css';

import Toast from './toast';

class Toaster extends Component {
  static propTypes = {
    toasts: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      type: Toast.propTypes.type,
      message: Toast.propTypes.message,
      actions: Toast.propTypes.actions
    })).isRequired,
    dismissToast: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired
  };

  _timeouts = {};

  dismiss(id) {
    const { dismissToast } = this.props;

    if (this._timeouts[id]) {
      clearTimeout(this._timeouts[id]);
      delete this._timeouts[id];
    }

    dismissToast(id);
  }

  dismissable(index) {
    const toast = this.props.toasts[index];

    if (toast.type !== 'attention') {
      if (toast.timeout) {
        this._timeouts[toast.id] = setTimeout(() => {
          this.dismiss(toast.id);
        }, toast.timeout);
      }

      return () => {
        this.dismiss(toast.id);
      };
    }
  }

  render() {
    const {
      toasts,
      dispatch
    } = this.props;

    return (
      <div className={styles.root}>
        {toasts.map((props, i) => (
          <Toast
              key={i}
              dispatch={dispatch}
              dismiss={this.dismissable(i)}
              {...props}/>
        ))}
      </div>
    );
  }
}

export default Toaster;
