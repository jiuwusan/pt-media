const router = require('koa-router')();
const torrents = require('../contoller/torrents');

router.use('/pt-api', torrents.routes(), torrents.allowedMethods());

module.exports = router;