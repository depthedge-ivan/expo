// Polyfill for Node.js 'stream' module
global.Stream = require('stream');
global.stream = require('stream');

// Polyfill for Node.js 'events' module
global.EventEmitter = require('events');
global.events = require('events');

// Polyfill for Node.js 'buffer' module
global.Buffer = require('buffer').Buffer;
global.buffer = require('buffer');

// Polyfill for Node.js 'util' module
global.util = require('util');

// Polyfill for Node.js 'crypto' module
global.crypto = require('crypto');

// Polyfill for Node.js 'url' module
global.URL = require('url').URL;
global.URLSearchParams = require('url').URLSearchParams; 