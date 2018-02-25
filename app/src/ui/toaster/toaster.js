import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './toaster.css';

import {
  removeToast,
  voteInPoll
} from '../../redux/toasts';

import Toast from './toast';

@connect(({ app, toasts }) => ({
  player: app.player,
  toasts
}), {
  removeToast,
  voteInPoll
})

class Toaster extends Component {
  static propTypes = {
    player: PropTypes.shape({
      name: PropTypes.string.isRequired
    }).isRequired,
    toasts: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      type: Toast.propTypes.type,
      message: Toast.propTypes.message
    })).isRequired,
    removeToast: PropTypes.func.isRequired,
    voteInPoll: PropTypes.func.isRequired
  };

  formatMessage(message) {
    let { player } = this.props;
    let nameReg = new RegExp(`(^|\\s+)${player.name}(\\s+|$)`);
    return message.replace(nameReg, '$1YOU$2');
  }

  renderPoll(poll) {
    let { removeToast, voteInPoll } = this.props;
    let message = this.formatMessage(poll.message);

    let vote = (v) => () => {
      voteInPoll(poll.id, v);
      removeToast(poll.id);
    };

    return (
      <Toast
          key={poll.id}
          type={poll.type}
          message={message}
          actions={[
            { label: 'Yes', action: vote(true) },
            { label: 'No', action: vote(false) }
          ]}/>
    );
  }

  renderNotice(notice) {
    let { removeToast } = this.props;
    let message = this.formatMessage(notice.message);
    let dismiss = () => removeToast(notice.id);

    return (
      <Toast
          key={notice.id}
          type={notice.type}
          message={message}
          dismiss={dismiss}/>
    );
  }

  render() {
    let { toasts } = this.props;

    return (
      <div className={styles.root}>
        {toasts.map((toast) => (
          toast.type === 'poll' ? (
            this.renderPoll(toast)
          ) : (
            this.renderNotice(toast)
          )
        ))}
      </div>
    );
  }
}

export default Toaster;
