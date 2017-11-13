import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './toaster.css';

import {
  removeToast,
  voteInPoll
} from '../../redux/toasts';

import Toast from './toast';

@connect(({ app, game, toasts }) => ({
  player: app.player && game.players[app.player],
  toasts
}), {
  removeToast,
  voteInPoll
})

class Toaster extends Component {
  static propTypes = {
    player: PropTypes.object,
    toasts: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      type: Toast.propTypes.type,
      message: Toast.propTypes.message
    })).isRequired,
    removeToast: PropTypes.func.isRequired,
    voteInPoll: PropTypes.func.isRequired
  };


  renderPoll(poll) {
    let { removeToast, voteInPoll } = this.props;

    let vote = (v) => () => {
      voteInPoll(poll.id, v);
      removeToast(poll.id);
    };

    return (
      <Toast
          key={poll.id}
          type={poll.type}
          message={poll.message}
          actions={[
            { label: 'Yes', action: vote(true) },
            { label: 'Yes', action: vote(false) }
          ]}/>
    );
  }

  renderNotice(notice) {
    let { removeToast } = this.props;
    let dismiss = () => removeToast(notice.id);

    return (
      <Toast
          key={notice.id}
          type={notice.type}
          message={notice.message}
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
