module.exports = ({ config }) => {
  config.resolve.alias = {
    'next/image': require.resolve('./__mocks__/NextJSImageMock.js'),
  };
  config.resolve.fallback = {
    https: false,
    http: false,
    crypto: false,
    url: false,
    assert: false,
    stream: false,
    path: false,
    os: false,
    zlib: false,
    buffer: false,
    tls: false,
    fs: false,
    net: false,
  };

  return config;
};
