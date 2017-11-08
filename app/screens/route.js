import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import pathToRegexp from 'path-to-regexp';

import { push, replace } from '../redux/router';

export default (
  mapStateToProps,
  mapDispatchToProps
) => (Wrapped) => {
  class Route extends Component {
    static propTypes = {
      path: PropTypes.string.isRequired,
      isMatch: PropTypes.bool.isRequired,
      params: PropTypes.object.isRequired,
      location: PropTypes.shape({
        pathname: PropTypes.string.isRequired
      }).isRequired,
      redirect: PropTypes.string,
      children: PropTypes.node,
      replace: PropTypes.func
    };

    state = {
      matched: this.getMatchingChild()
    };

    componentWillMount() {
      let { replace, redirect } = this.props;

      if (redirect && !this.state.matched) {
        replace(redirect);
      }
    }

    componentWillReceiveProps(nextProps) {
      let matched = this.getMatchingChild(nextProps);

      if (!matched && nextProps.redirect) {
        this.props.replace(nextProps.redirect);
      } else if (matched && matched !== this.state.matched) {
        this.setState({ matched });
      }
    }

    getMatchingChild({ location, children } = this.props) {
      return Children.toArray(children).reduce((match, child) => {
        if (!match) {
          let re = pathToRegexp(child.props.path, [], { end: true });
          if (re.exec(location.pathname)) return child;
        }

        return match;
      }, null);
    }

    render() {
      // eslint-disable-next-line no-unused-vars
      let { path, isMatch, children, ...props } = this.props;
      let { matched } = this.state;

      return isMatch ? (
        // eslint-disable-next-line react/no-children-prop
        <Wrapped children={matched} {...props}/>
      ) : null;
    }
  }

  return connect((state, { path }) => {
    let tokens = [];
    let re = pathToRegexp(path, tokens, { end: true });
    let { location } = state.router;
    let match = re.exec(location.pathname);
    let isMatch = !!match;
    let params = {};

    for (let i = 0, l = tokens.length; i < l; i++) {
      let token = tokens[i];

      if (typeof token.name === 'string') {
        params[token.name] = match && match[i + 1];
      }
    }

    let props = mapStateToProps ? (
      mapStateToProps(state, {
        ...props,
        location,
        isMatch,
        params
      })
    ) : {};

    return {
      params,
      isMatch,
      location,
      ...props
    };
  }, {
    push,
    replace,
    ...(mapDispatchToProps || {})
  })(Route);
};
