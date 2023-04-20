const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    console.log('HTTP 中间件')
    app.use('/pt-api/**', createProxyMiddleware({
        target: 'http://localhost:39909',
        changeOrigin: true
    }));
};