import React from 'react';
import ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader/root';

import AppRoot from './root';

const HotApp = hot(AppRoot);
const $root = document.getElementById('root');

ReactDOM.render(<HotApp/>, $root);
