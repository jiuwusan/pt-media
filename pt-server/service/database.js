const path = require('path');
const fs = require('fs');

let DATAJSON

const genPath = (p) => {
    let root = (__dirname + '').replace(/(\\|\/)service/, '')
    return path.join(root, p);
}

const database = () => {
    if (!DATAJSON) {
        let databasePath = genPath('/database/data.json');
        try {
            let dataStr = fs.readFileSync(databasePath, 'utf8');
            DATAJSON = JSON.parse(dataStr);
        } catch (error) {
            fs.writeFileSync(databasePath, JSON.stringify({}), 'utf8')
            console.log('数据库读取失败');
        }
    }
    return DATAJSON || {}
}

/**
 * 异步写入
 * @param {*} database 
 */
const update = async (database) => {
    let databasePath = genPath('/database/data.json');
    fs.writeFileSync(databasePath, JSON.stringify(database), 'utf8')
}

/**
 * 更新 cookie
 * 
 * @returns 
 */
function setCookie(index, cookie) {
    let data = database();
    console.log(data)
    data.website[index].cookie = cookie
    update(data)
}

/**
 * 获取网站列表
 * @returns 
 */
const website = () => {
    return (database().website || []).map((item, index) => {
        item.setCookie = function (cookie) {
            this.cookie = cookie;
            setCookie(index, cookie)
            return this;
        }
        return item
    })
}

/**
 * 获取 qb 信息
 * @returns 
 */
const qb = () => {
    let data = database();
    data.qBittorrent.setCookie = function (cookie) {
        data.qBittorrent.cookie = cookie
        update(data)
        return data.qBittorrent;
    }
    return data.qBittorrent
}


module.exports = {
    database,
    website,
    setCookie,
    qb
}