import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './toaster.css';

import { removeToast } from '../../redux/toasts';

import Toast from './toast';

@connect(({ toasts }) => ({
  toasts
}), (dispatch) => ({
  removeToast: (id) => dispatch(removeToast(id)),
  dispatch
}))

class Toaster extends Component {
  static propTypes = {
    toasts: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      type: Toast.propTypes.type,
      message: Toast.propTypes.message,
      actions: Toast.propTypes.actions
    })).isRequired,
    removeToast: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired
  };

  _timeouts = {};

  dismiss(id) {
    const { removeToast } = this.props;

    if (this._timeouts[id]) {
      clearTimeout(this._timeouts[id]);
      delete this._timeouts[id];
    }

    removeToast(id);
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
