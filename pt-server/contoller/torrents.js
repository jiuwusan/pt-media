const router = require('koa-router')();
const pt = require('../service/pt')
const ocrApi = require('../service/ocr')

const torrents = async (ctx) => {
    let { search } = ctx.request.query;
    if (!search) throw new Error('关键词不能为空')
    ctx.body = {
        code: 0,
        msg: '成功',
        data: await pt.queryTorrents(search)
    }
}

const ocr = async (ctx) => {
    let result = await ocrApi.ocrImageCode('https://hdfans.org/image.php?action=regimage&imagehash=f6050bea705015d4edd59a78a4ff6d57&secret=');
    ctx.body = {
        code: 0,
        msg: '成功',
        data: result
    }
}

const userLogin = async (ctx) => {
    let data = await pt.userLogin()

    ctx.body = {
        code: 0,
        msg: '成功',
        data
    }
}

router.get('/torrents', torrents);
router.get('/ocr', ocr);
router.get('/userLogin', userLogin);

module.exports = router