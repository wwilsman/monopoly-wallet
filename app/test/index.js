require('regenerator-runtime/runtime');

mocha.timeout(0);

const requireTest = require.context('.', true, /\.test$/);
requireTest.keys().forEach(requireTest);
