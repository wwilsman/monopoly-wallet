import React from 'react';
import ReactDOM from 'react-dom';

import AppRoot, { createAppContext } from './root';

const context = createAppContext();
const $root = document.getElementById('root');
ReactDOM.render(<AppRoot context={context}/>, $root);
