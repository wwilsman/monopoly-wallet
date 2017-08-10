const requireTest = require.context('.', false, /-test$/);
requireTest.keys().forEach(requireTest);
