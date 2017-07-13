import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import AppRoot from './root';

const render = () => {
  ReactDOM.render(
    <AppContainer><AppRoot/></AppContainer>,
    document.getElementById('react-root')
  );
};

if (module.hot) {
  module.hot.accept('./root', render);
}

render();
