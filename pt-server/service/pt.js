const cheerio = require('cheerio')
const database = require('./database')
const ocrApi = require('./ocr')
const request = require('./request')
const site = require('./site')
const qBittorrent = require('./qBittorrent')

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
    const { data } = await request.browser(`${website.hostname}${website.login}`)
    if (match(body, 'Just a moment'))
        throw new Error('M-Team 站 cookie 过期，需要手动更新')
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
const queryTorrents = async (search = '', uploader = false) => {
    let websites = database.website();
    let torrents = [];
    for (let i = 0; i < websites.length; i++) {
        const item = websites[i];
        if (uploader && !item.uploading)
            continue;
        item.uploading = uploader
        // 关键词编码
        try {
            const body = await loadWebsite(item, search)
            const $ = await cheerio.load(body);
            torrents.push.apply(torrents, await site[item.name]($, item));
        } catch (error) {
            console.log(error)
        }
    }

    return torrents
}

/**
 * 加载 列表
 * @param {*} website 
 * @param {*} search 
 */
const download = async (url, source, uid) => {
    let websites = database.website();
    let regExp = /^https?:\/\/.+/g;
    let website = ''
    for (let i = 0; i < websites.length; i++) {
        const item = websites[i];
        if (source === item.name) {
            website = item;
            if (!regExp.test(url))
                url = item.hostname + url
            break;
        }

    }
    // 尝试 获取的次数
    let count = 0
    const loadFile = async (web, loadurl) => {
        if (count > 3) throw new Error('文件下载失败')
        count++;
        const match = (str, keyword) => str.indexOf(keyword) > -1;
        let { data, headers } = await request.browser(loadurl, web.cookie, { encoding: null });
        if (match(data, 'name="username"') && match(data, 'name="password"')) {
            // 登录失败，重新获取 cookie
            web = web.setCookie(await userLogin(web));
            await request.sleep(1000);
            return await loadweb(web, search)
        }
        return {
            headers: {
                'content-disposition': headers['content-disposition'],
                'transfer-encoding': headers['transfer-encoding'],
                'content-type': headers['content-type']
            },
            data
        }
    }

    return await loadFile(website, url)
}


// 轮询
const polling = async () => {
    // 做一个随机延时
    let randomTime = parseInt(Math.random() * 30);
    console.log(`--> ${randomTime}s 后开始获取种子列表 -> `, new Date())
    await request.sleep(randomTime * 1000)

    let { seedings = [] } = database.data();
    // 将过期的移除
    for (let i = 0; i < seedings.length; i++) {
        let item = seedings[i];
        try {
            // 当前种子免费时间到了
            if (Date.now() > new Date(item.expires).getTime()) {
                await qBittorrent.delete(item.hash, true);
                seedings.splice(i, 1);
                i--;
            }
        } catch (error) {
            console.log(`uploader delete error (source=${item.source},uid=${item.uid}) : `, error)
        }
    }

    if (seedings.length < 10) {
        let torrents = await queryTorrents('', true);
        torrents = torrents.filter((item) => ((item.free || item.free2x) && item.expires))

        //开始添加
        for (let i = 0; i < torrents.length; i++) {
            if (seedings.length > 10) break;
            const { download: url, source, uid, expires, seeding } = torrents[i];
            // 存在则跳过,或者做种人数大于等于10 跳过
            if (seedings.find((item) => item.uid === uid && item.source === source) || seeding >= 10) {
                console.log(`source=${source},uid=${uid},seeding=${seeding} 不符合要求`)
                continue;
            }

            try {
                // 下载文件流
                let load = await download(url, source, uid);
                // 将流传入, 加入 seeding 分类
                let { hash } = await qBittorrent.add(load.data, load.headers['content-disposition'].match(/([^"]+)/g)[1], 'seeding')
                // 加入队列
                seedings.push({ hash, uid, source, expires })
            } catch (error) {
                console.log(`uploader error (source=${source},uid=${uid}) : `, error)
            }
        }
    }
    console.log(`uploader 队列长度 = ${seedings.length}`)
    // 更新数据
    database.setData({ seedings })

}

module.exports = {
    polling,
    queryTorrents,
    userLogin,
    download
}