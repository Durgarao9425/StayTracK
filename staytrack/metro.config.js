const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for CSS (NativeWind)
config.resolver = {
    ...config.resolver,
    sourceExts: [...config.resolver.sourceExts, 'css'],
};

module.exports = config;
