const database = require('./database')
const request = require('./request')
const fs = require('fs')
const path = require('path');

/**
 * 获取 token
 */
const takeLogin = async (url, form) => {
    const match = (str, keyword) => str.indexOf(keyword) > -1;
    let response = await request.noFormat({
        url, form, method: 'POST', headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
        }
    })
    let { body } = response
    if (match(body, 'Fails')) {
        console.log('qBittorrent 登录失败')
        return ''
    }

    return response.headers['set-cookie'].toString()
}

/**
 * 根路径
 * @param {*} p 
 * @returns 
 */
const genPath = (p) => {
    let root = (__dirname + '').replace(/(\\|\/)service/, '')
    return path.join(root, p);
}

// 用户登录
const qbLogin = async () => {
    console.log(`qBittorrent cookie 失效，尝试获取`)
    let qBittorrent = database.qb();
    let cookie = ''
    for (let i = 0; i < 3; i++) {
        cookie = await takeLogin(qBittorrent.hostname + '/api/v2/auth/login', { username: qBittorrent.username, password: qBittorrent.password });
        if (cookie)
            break;
        await request.sleep(1000);
    }

    if (!cookie) throw new Error('qBittorrent 3次 登录失败')
    cookie = cookie.split(";")[0]
    qBittorrent.cookie = cookie
    database.setData({ qBittorrent })
    return cookie;
}

/**
 * 获取种子临时路径
 * 
 * @param {*} data 
 * @param {*} filename 
 * @returns 
 */
const getTorrentPath = (data, filename) => {
    let filePath = genPath(`/database/temp/` + filename)
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, Buffer.from(new Uint8Array(data)), function (error) {
            if (error) {
                reject(error);
            } else {
                resolve(filePath);
            }
        })
    })
}

/**
 * 浏览器访问
 * @param {*} fn 
 */
const qbBrowser = async (opt) => {
    let count = 0;
    async function withCookie(options) {
        // 次数+1
        count++;
        let qb = database.qb();
        if (!(/^https?:\/\/.+/g).test(options.url))
            options.url = qb.hostname + options.url
        // 添加 cookie
        options.headers = {
            cookie: qb.cookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
            ...(options.headers || {})
        }
        let res = await request(options) || ''
        // 登录失效
        if (res.statusCode === 403 && count > 3)
            throw new Error('qBittorrent 登录失败')
        else if (res.statusCode === 403) {
            // 重新获取 cookie
            options.headers.cookie = await qbLogin()
            // 再次 发起请求
            return await withCookie(options)
        } else if (res.data.indexOf('Fail') > -1)
            throw new Error('qBittorrent 操作失败',res.data)
        // 返回值
        return res.data
    }
    return await withCookie(opt)
}

/**
 * 获取最新一条数据
 * 
 * @returns 
 */
const getLastDowning = async () => {
    let data = await qbBrowser({ url: '/api/v2/torrents/info?limit=1&category=seeding&sort=added_on&reverse=true' })
    let torrents = []
    if (data)
        torrents = JSON.parse(data)
    return torrents[0]
}

/**
 * 添加 种子
 * @param {*} binaryFile 
 * @returns 
 */
const addTorrent = async (binaryData, filename, category = 'download') => {

    let formData = {
        'torrents': fs.createReadStream(await getTorrentPath(binaryData, filename)),
        autoTMM: 'true',
        rename: '',// 重命名
        category,//分类
        paused: 'false',//开始
        stopCondition: 'None',
        contentLayout: 'Original',
        dlLimit: 30000000,
        upLimit: 13000000
    }

    // 发起请求
    await qbBrowser({ url: '/api/v2/torrents/add', formData, method: 'POST', headers: { 'content-type': 'multipart/form-data' } })
    // 获取最新一条数据
    await request.sleep(3000);
    let torrent = await getLastDowning()
    console.log(`成功添加 -> 分类：${category}，Hash：${torrent.hash}，种子：${filename}`)
    return torrent
}

/**
 * 删除 种子
 * @param {*} hashes 
 */
const delTorrent = async (hashes, deleteFiles = false) => {
    if (Object.prototype.toString.call(hashes) === '[object Array]')
        hashes = hashes.join('|')
    let form = { hashes, deleteFiles }
    let result = await qbBrowser({ url: `/api/v2/torrents/delete`, form, method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' } })
    console.log(`成功删除 -> Hash = ${hashes}`)
    return result
}

/**
 * 获取详细数据
 * 
 * @returns 
 */
const detailTorrent = async (hashes) => {
    let data = await qbBrowser({ url: `/api/v2/torrents/info?limit=1&hashes=${hashes}` })
    let torrents = []
    if (data)
        torrents = JSON.parse(data)
    return torrents[0]
}

/**
 * 种子状态
 * 
 * @returns 
 */
const state = async (hashes) => {
    let data = await detailTorrent(hashes);
    //stalledUP = 做种中 ，stalledDL = 等待下载，downloading = 下载中
    let result = data.state;
    // 1 小时未开始下载，可能是死种
    if (Date.now() - new Date(data.added_on) > 1000 * 60 * 60 && result === 'stalledDL')
        result = 'obsoleted'; // 过时的
    return result
}

module.exports = {
    add: addTorrent,
    delete: delTorrent,
    detail: detailTorrent,
    state
}