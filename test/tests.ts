/// <reference types="mocha" />
/// <reference types="node" />

/* tslint:disable */
process.env.NODE_ENV = 'test';

require('source-map-support').install();

console.warn = console.error = (...messages: string[]) => {
  console.log(`==> Error in test: Tried to log warning or error with message:
`, ...messages);
  if (!process.env.CI) {
    process.exit(1);
  }
};

process.on('unhandledRejection', () => {});

import './Fragment';
