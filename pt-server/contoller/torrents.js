const router = require('koa-router')();
const pt = require('../service/pt')
const ocrApi = require('../service/ocr')
const media = require('../service/media')
const qb = require('../service/qBittorrent')
const fs = require('fs')

const torrents = async (ctx) => {
    let { search } = ctx.request.query;
    if (!search) throw new Error('关键词不能为空');
    let datalist = await pt.queryTorrents(search)
    datalist.sort(function (prve, next) {
        let result = new Date(next.createTime).getTime() - new Date(prve.createTime).getTime();
        return result
    })
    ctx.body = {
        code: 0,
        msg: '成功',
        data: datalist
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

const getPoster = async (ctx) => {
    let { keyword, type } = ctx.request.query;
    let posterUrl = await media.getPoster(keyword, type)
    ctx.redirect(posterUrl);
}

const download = async (ctx) => {
    let { url, source, uid } = ctx.request.query || {};
    if (!url || !source || !uid)
        throw new Error('参数异常')
    url = decodeURIComponent(url)
    let { headers, data } = await pt.download(url, source, uid);
    // 设置头部
    for (const key in headers) {
        ctx.set(key, headers[key])
    }
    ctx.body = data
}

const toJellyfin = async (ctx) => {
    let { url, source, uid, category } = ctx.request.query || {};
    if (!url || !source || !uid)
        throw new Error('参数异常')
    url = decodeURIComponent(url)
    let { headers, data } = await pt.download(url, source, uid);
    let filename = headers['content-disposition'].match(/([^"]+)/g)[1]
    ctx.body = {
        code: 0,
        msg: '成功',
        data: await qb.add(data, filename, category)

    }
}

router.get('/torrents', torrents);
router.get('/ocr', ocr);
router.get('/poster', getPoster);
router.get('/userLogin', userLogin);
router.get('/toJellyfin', toJellyfin);
router.get('/download', download);
module.exports = router