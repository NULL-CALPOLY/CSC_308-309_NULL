const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
try {
  // make React available for tests that expect the `React` identifier
  global.React = require('react');
} catch (e) {
  // ignore if react isn't installed in this environment
}

module.exports = {};
