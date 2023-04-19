const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    console.log('HTTP 中间件')
    app.use('/sub-api/**', createProxyMiddleware({
        target: 'http://localhost:31101',
        changeOrigin: true
    }));
};