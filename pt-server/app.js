const Koa = require('koa');
const koaJson = require('koa-json');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const http = require('http');
const fs = require('fs');
const serve = require('koa-static');
const schedule = require('./schedule');
const static = serve(path.join(__dirname) + '/public/');

const genPath = (p) => {
    return path.join(__dirname, p);
}
// 初始化定时任务
schedule.create();
// 初始化 Koa
const app = new Koa();

app.use(static);
app.use(bodyParser());
app.use(koaJson());

// 挂载全局方法
app.use(async (ctx, next) => {
    ctx.genPath = genPath;
    // 挂载全局方法
    try {
        await next();
    } catch (error) {
       console.log('error -> ',error)
        ctx.body = {
            code: error.code || 99,
            msg: error.message,
            data: error.data
        }
    }
});

// routes
fs.readdirSync(path.join(__dirname, 'routes')).forEach(function (file) {
    if (~file.indexOf('.js')) app.use(require(path.join(__dirname, 'routes', file)).routes());
});

app.use(function (ctx, next) {
    ctx.redirect('/404.html');
});

http.createServer(app.callback())
    .listen(39909)
    .on('listening', function () {
        console.log('server listening on: ' + 39909)
    });