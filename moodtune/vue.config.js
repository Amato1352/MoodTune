module.exports = {
  publicPath: '/MoodTune/',
  devServer: {
    https: true,
    host: '0.0.0.0',
    allowedHosts: 'all',
    client: {
      webSocketURL: {
        protocol: 'auto',
        hostname: '0.0.0.0',
        port: 8080,
        pathname: '/ws'
      }
    }
  }
}
