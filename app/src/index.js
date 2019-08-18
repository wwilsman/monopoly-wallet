import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';

import AppRoot from './root';

const history = createBrowserHistory();
const $root = document.getElementById('root');
ReactDOM.render(<AppRoot history={history}/>, $root);
