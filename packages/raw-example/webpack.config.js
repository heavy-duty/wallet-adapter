module.exports = (config) => {
  config.resolve.fallback = {
    crypto: false,
    stream: false,
  };

  return config;
};
