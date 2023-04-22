const router = require('koa-router')();
const pt = require('../service/pt')
const media = require('../service/media')
const qb = require('../service/qBittorrent')

/**
 * 种子列表
 * @param {*} ctx 
 */
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

/**
 * 海报
 * @param {*} ctx 
 */
const getPoster = async (ctx) => {
    let { keyword, type } = ctx.request.query;
    let posterUrl = await media.getPoster(keyword, type)
    ctx.redirect(posterUrl);
}

/**
 * 下载
 * @param {*} ctx 
 */
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

/**
 * 添加到jellyfin
 * @param {*} ctx 
 */
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

/**
 * TEST 接口
 * @param {*} ctx 
 */
const apitest = async (ctx) => {
    ctx.body = {
        code: 0,
        msg: '成功',
        data: await qb.delete('015e82c426ca4009b5f96995f4207337e7cd2c61', true)
    }
}

router.get('/torrents', torrents);
router.get('/poster', getPoster);
router.get('/toJellyfin', toJellyfin);
router.get('/download', download);
router.get('/apitest', apitest);

module.exports = router