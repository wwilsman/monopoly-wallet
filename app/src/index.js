import React from 'react';
import ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader';

import AppRoot from './root';

const HotApp = hot(module)(AppRoot);
const $root = document.getElementById('react-root');

ReactDOM.render(<HotApp/>, $root);
