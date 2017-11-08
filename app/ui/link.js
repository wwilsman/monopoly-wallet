import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { push } from '../redux/router';

@connect(null, { push })
class Link extends Component {
  static propTypes = {
    to: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    push: PropTypes.func.isRequired
  };

  handleClick = (e) => {
    let { to, onClick, push } = this.props;
    let bubble = onClick && onClick(e);

    if (bubble !== false && !e.defaultPrevented) {
      e.preventDefault();
      push(to);
    }

    return bubble;
  };

  render() {
    // eslint-disable-next-line no-unused-vars
    let { to, onClick, push, ...props } = this.props;

    return (
      <a href={to} onClick={this.handleClick} {...props}/>
    );
  }
}

export default Link;
