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

const genPath = (p) => {
    let root = (__dirname + '').replace(/(\\|\/)service/, '')
    return path.join(root, p);
}

// 用户登录
const qbLogin = async () => {
    console.log(`qBittorrent cookie 失效，尝试获取`)
    let qb = database.qb();
    let cookie = ''
    for (let i = 0; i < 3; i++) {
        cookie = await takeLogin(qb.hostname + '/api/v2/auth/login', { username: qb.username, password: qb.password });
        if (cookie)
            break;
        await request.sleep(1000);
    }
    if (!cookie) throw new Error('qBittorrent 3次 登录失败')
    cookie = cookie.split(";")[0]
    qb.setCookie(cookie)
    return cookie;
}

const getTorrentPath = (data, filename) => {
    let filePath = genPath('/database/temp/' + filename)
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
 * 添加 种子
 * @param {*} binaryFile 
 * @returns 
 */
const addTorrent = async (binaryData, filename) => {

    let qb = database.qb();
    let formData = {
        'fileselect[]': fs.createReadStream(await getTorrentPath(binaryData, filename)),
        autoTMM: 'true',
        rename: '',// 重命名
        category: 'download',//分类
        paused: 'false',//开始
        stopCondition: 'None',
        contentLayout: 'Original',
        dlLimit: 30000000,
        upLimit: 3000000
    }
    // let cookie = await qbLogin()
    let { body } = await request.noFormat({
        url: qb.hostname + '/api/v2/torrents/add', formData, method: 'POST', headers: {
            cookie: 'SID=W3MDGPVlP+ZaSQpeK6ExNeKRuhlz2AJO',
            'content-type': 'multipart/form-data',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
        }
    })
    if (body.indexOf('Forbidden') > -1 && body.indexOf('Fail') > -1) {
        await qbLogin();
        return addTorrent(binaryData, filename)
    }

    return { body }
}

const delTorrent = (uid) => {

}

module.exports = {
    add: addTorrent,
    del: delTorrent
}