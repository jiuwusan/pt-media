const cheerio = require('cheerio')
const database = require('./database')
const ocrApi = require('./ocr')
const request = require('./request')
const site = require('./site')

/**
 * 获取链接参数
 * @param {*} url 
 * @param {*} params 
 * @returns 
 */
function queryUrlParams(url, params) {
    var res = new RegExp("(?:&|/?)" + params + "=([^&$]+)").exec(url);
    return res ? res[1] : '';
}

/**
 * 获取 token
 */
const takeLogin = async (url, form) => {
    console.log(`提交 Form 表单`, url, form)
    const match = (str, keyword) => str.indexOf(keyword) > -1;
    let response = await request.noFormat({
        url, form, method: 'POST', headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
        }
    })
    let { body } = response
    if ((match(body, '登录') && match(body, '注册') && match(body, '图片代码无效')) || match(body, '失败') || match(body, 'name="username"') || match(body, 'login.php')) {
        console.log('登录失败 -> ', body)
        return ''
    }

    return response.headers['set-cookie'].toString()
}

// 用户登录
const postLogin = async (website) => {
    const { data, cookie } = await request.browser(`${website.hostname}${website.login}`)
    console.log()
    const $ = await cheerio.load(data);
    // 取到登录所需参数
    let codeHost = $($('form').get(1)).find('img').attr('src')
    let imagestring = ''
    let imagehash = ''
    let secret = ''

    if (codeHost) {
        imagestring = await ocrApi.ocrImageCode(`${website.hostname}${codeHost}`);
        imagehash = queryUrlParams(codeHost, 'imagehash')
        secret = queryUrlParams(codeHost, 'secret')
    }

    let formData = {
        username: website.username,
        password: website.password,
        two_step_code: website.twoStepCode,
        imagestring,
        imagehash,
        secret,
        returnto: '/torrents.php'
    }
    await request.sleep(1000);

    return await takeLogin(`${website.hostname}${website.takelogin}`, formData);
}

// 用户登录
const userLogin = async (website) => {
    console.log(`${website.name} cookie 失效，尝试获取`)
    let cookie = ''
    for (let i = 0; i < 3; i++) {
        cookie = await postLogin(website);
        if (cookie)
            break;
        await request.sleep(1000);
    }
    return request.parseCookie(cookie).cookieStr;
}


/**
 * 加载 列表
 * @param {*} website 
 * @param {*} search 
 */
const loadWebsite = async (website, keyword) => {
    // 尝试 获取的次数
    let count = 0
    const loadweb = async (web, search) => {
        if (count > 3) return ''
        count++;
        const match = (str, keyword) => str.indexOf(keyword) > -1;
        let { data, cookie } = await request.browser(`${web.hostname}${web.torrents}?search=${encodeURIComponent(search)}`, web.cookie);
        if (match(data, 'name="username"') && match(data, 'name="password"')) {
            // 登录失败，重新获取 cookie
            web = web.setCookie(await userLogin(web));
            await request.sleep(1000);
            return await loadweb(web, search)
        }
        // if (cookie !== web.cookie)
        //     web.setCookie(cookie);
        return data
    }
    return await loadweb(website, keyword)
}

/**
 * 获取中字列表
 * 
 * @param {*} search 
 * @returns 
 */
const queryTorrents = async (search = '') => {
    let websites = database.website();
    let torrents = [];
    for (let i = 0; i < websites.length; i++) {
        const item = websites[i];
        // 关键词编码
        try {
            const body = await loadWebsite(item, search)
            const $ = await cheerio.load(body);
            torrents.push.apply(torrents, await site[item.name]($));
        } catch (error) {
            console.log(error)
        }
    }

    return torrents
}


// 轮询
const polling = () => {
    console.log('开始轮询');
}

module.exports = {
    polling,
    queryTorrents,
    userLogin
}