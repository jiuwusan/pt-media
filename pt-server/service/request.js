const request = require('request')

/**
 * 
 * @returns 
 */
function parseCookie(cookie) {
    let pattern = /([^,=;\s]+)=([^;,]+)(?=(;\sexpires))/g
    let result = cookie.match(pattern)
    return {
        cookieStr: result.join('; '),
        parseCookie: result.reduce((prve, next) => {
            next = next.split('=')
            prve[next[0]] = next[1]
            return prve
        }, {}),
        cookie
    };
}

/**
 * 模拟浏览器
 * @param {*} url 
 * @param {*} cookie 
 * @returns 
 */
const browser = (url, cookie = '') => {
    // console.log('浏览器 -> ',url)
    return new Promise((resolve, reject) => {
        // 发送请求
        request({
            url,
            method: 'GET',
            headers: {
                cookie, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
            }
        }, (error, response, data) => {
            if (!error) {
                // 新的 cookie
                let newCookie = response.headers['set-cookie'] || cookie;
                newCookie = newCookie.toString();
                console.log('newCookie==',newCookie);
                resolve({
                    data,
                    cookie: newCookie !== cookie ? newCookie : ''
                })
            }
            reject(error)
        })
    })
}

/**
 * 原始数据返回
 * @param {*} options 
 * @returns 
 */
const noFormat = (options) => {
    return new Promise((resolve, reject) => {
        // 发送请求
        request(options, (error, response) => {
            if (!error) {
                resolve(response)
            }
            reject(error)
        })
    })
}

// 休眠
const sleep = (dep = 0) => {
    return new Promise((resolve) => {
        let T = setTimeout(() => {
            clearTimeout(T);
            resolve(`休眠 ${dep} ms`)
        }, dep)
    })
}

/**
 * 自定义 请求
 */
const cusRequest = (options) => {
    return new Promise((resolve, reject) => {
        options.headers = { 'content-type': 'application/json', ...(options.headers || {}) }
        // 发送请求
        request(options, (error, response, data) => {
            if (!error) {
                if (response.statusCode == 200)
                    resolve(data)
                reject(response)
            }
            reject(error)
        })
    })
}

cusRequest.browser = browser
cusRequest.noFormat = noFormat
cusRequest.sleep = sleep
cusRequest.parseCookie = parseCookie

module.exports = cusRequest