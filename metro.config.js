const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable unstable_enablePackageExports
config.resolver.unstable_enablePackageExports = false;

module.exports = config; 