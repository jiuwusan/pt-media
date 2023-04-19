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
 * 格式化信息
 */
const formatInfo = (torrent) => {
    let pattern1 = /(全|第)[1234567890一二三四五六七八九十零]+([-,，][1234567890一二三四五六七八九十零]+)?(季|集)/g;
    let pattern2 = /[\u4e00-\u9fa5：:()\（\）\d]+/g;
    const match = (str, keyword) => str.indexOf(keyword) > -1;
    (torrent.chinese.match(pattern1) || []).forEach((item) => {
        if (match(item, '季'))
            torrent.season = item
        else if (match(item, '集'))
            torrent.episode = item
    })
    let titles = torrent.chinese.match(pattern2) || [];
    torrent.shortTitle = titles[0] || ''
    if (torrent.shortTitle.match(/[劇剧版:]{2}/g))
        torrent.shortTitle = titles[1]
    return torrent
}

/**
 * 红豆站
 * 
 * @param {*} $ 
 * @returns 
 */
const HDFans = async ($) => {
    let torrents = [];
    let trs = $('.torrents').children('tbody').children('tr')
    for (let i = 0; i < trs.length; i++) {
        if (i > 0) {
            let torrent = {};
            const tds = $(trs[i]).children('.rowfollow');
            let torrentInfo = $(tds[1]).children('.torrentname').children('tbody').children('tr').children('td')
            torrent.mediaType = $(tds[0]).children('a').children('img').attr('title')
            // 英文标题
            torrent.title = $(torrentInfo[0]).children('a').attr('title')
            // 详细路径
            torrent.details = '/' + $(torrentInfo[0]).children('a').attr('href')
            // 是否免费
            torrent.free2x = $(torrentInfo[0]).find('.pro_free2up').length > 0;
            torrent.free = $(torrentInfo[0]).find('.pro_free').length > 0
            if (torrent.free) {
                // 免费剩余时间
                torrent.expires = $(torrentInfo[0]).find('.pro_free').next().children('span').attr('title')
            }
            // label
            torrent.label = []
            $(torrentInfo[0]).find('br').nextAll('span').each((i, elem) => {
                torrent.label.push($(elem).text())
            })
            // 中文名称
            let lastText = $(torrentInfo[0]).children().last().text()
            torrent.chinese = $(torrentInfo[0]).text();
            torrent.chinese = torrent.chinese.substring(torrent.chinese.indexOf(lastText) + lastText.length)
            // 下载链接
            torrent.download = $(torrentInfo[2]).children('a').attr('href')
            // 来源
            torrent.source = 'HDFans'
            // id
            torrent.uid = queryUrlParams(torrent.details, 'id')
            torrents.push(formatInfo(torrent));
        }
    }

    return torrents
}

/**
 * PTTime
 * 
 * @param {*} $ 
 * @returns 
 */
const PTTime = async ($) => {
    let torrents = [];
    let trs = $('.torrents').children('tbody').children('tr')
    for (let i = 0; i < trs.length; i++) {
        if (i > 0) {
            let torrent = {};
            const tds = $(trs[i]).children('.rowfollow');
            // 类别
            torrent.mediaType = $(tds[0]).children('a').children('img').attr('title')
            // 相关信息
            let torrentInfo = $(tds[1]).children('.torrentname').children('tbody').children('tr').children('.embedded')
            // 海报
            torrent.poster = $(tds[1]).children('.torrentname').children('tbody').children('tr').children('.torrentimg').children('img').attr('src')
            // 英文标题
            torrent.title = $(torrentInfo[0]).children('a').attr('title')
            // 详细路径
            torrent.details = $(torrentInfo[0]).children('a').attr('href')
            // 是否免费
            // torrent.free2x = $(torrentInfo[0]).find('.pro_free2up').length > 0;
            torrent.free = $(torrentInfo[0]).find('.promotion .free').length > 0
            if (torrent.free) {
                // 免费剩余时间
                torrent.expires = $(torrentInfo[0]).find('.promotion .free').next().attr('title')
            }
            // label
            torrent.label = []
            $(torrentInfo[0]).find('.dib .cp').children('span').each((i, elem) => {
                torrent.label.push($(elem).text())
            })
            // 中文名称
            torrent.chinese = $(torrentInfo[0]).children().last().text()
            // 下载链接
            torrent.download = $(torrentInfo[1]).children('table').children('tbody').children('tr').children('td').last().children('a').first().attr('href')
            // 来源
            torrent.source = 'PTTime'
            // id
            torrent.uid = queryUrlParams(torrent.details, 'id')
            torrents.push(formatInfo(torrent));
        }
    }

    return torrents
}

/**
 * MTeam
 * 
 * @param {*} $ 
 * @returns 
 */
const MTeam = async ($) => {
    let torrents = [];
    let trs = $('.torrents').children('tbody').children('tr')
    for (let i = 0; i < trs.length; i++) {
        if (i > 0) {
            let torrent = {};
            const tds = $(trs[i]).children('td');
            // 类别
            torrent.mediaType = $(tds[0]).children('a').children('img').attr('title')
            // 海报
            torrent.poster = $(tds[1]).children('.torrentname').children('tbody').children('tr').children('.torrentimg').find('img').attr('src')
            // 相关信息
            let torrentInfo = $(tds[1]).children('.torrentname').children('tbody').children('tr').children('.embedded')
            // 英文标题
            torrent.title = $(torrentInfo[0]).children('a').attr('title')
            // 详细路径
            torrent.details = $(torrentInfo[0]).children('a').attr('href')
            // 是否免费
            // torrent.free2x = $(torrentInfo[0]).find('.pro_free2up').length > 0;
            torrent.free = $(torrentInfo[0]).find('.pro_free').length > 0
            if (torrent.free) {
                // 免费剩余时间
                torrent.expires = $(torrentInfo[0]).find('.pro_free').next().text()
            }
            // label
            torrent.label = []
            $(torrentInfo[0]).find('.label_sub').each((i, elem) => {
                torrent.label.push($(elem).attr('alt'))
            })
            // 中文名称
            torrent.chinese = $(torrentInfo[0]).html().split('<br>')[1];
            // 下载链接
            torrent.download = $(torrentInfo[1]).children('a').first().attr('href')
            // 来源
            torrent.source = 'MTeam'
            // id
            torrent.uid = queryUrlParams(torrent.details, 'id')
            torrents.push(formatInfo(torrent));
        }
    }

    return torrents
}

/**
 * HDSky
 * 
 * @param {*} $ 
 * @returns 
 */
const HDSky = async ($) => {
    let torrents = [];
    let trs = $('.torrents').children('tbody').children('tr')
    for (let i = 0; i < trs.length; i++) {
        if (i > 0) {
            let torrent = {};
            const tds = $(trs[i]).children('.rowfollow');
            // 类别
            torrent.mediaType = $(tds[0]).children('a').children('img').attr('title')
            // 海报
            // torrent.poster = $(tds[1]).children('.torrentname').children('tbody').children('tr').children('.torrentimg').find('img').attr('src')
            // 相关信息
            let torrentInfo = $(tds[1]).children('.torrentname').children('tbody').children('tr').children('.embedded')
            // 英文标题
            torrent.title = $(torrentInfo[0]).children('a').attr('title')
            // 详细路径
            torrent.details = $(torrentInfo[0]).children('a').attr('href')
            // 是否免费
            // torrent.free2x = $(torrentInfo[0]).find('.pro_free2up').length > 0;
            torrent.free = $(torrentInfo[0]).find('.pro_free').length > 0
            if (torrent.free) {
                // 免费剩余时间
                torrent.expires$(torrentInfo[0]).find('.pro_free').attr('onmouseover').match(/[\d-:\s]{19}/g)[0];
            }
            // label
            torrent.label = []
            $(torrentInfo[0]).find('.optiontag').each((i, elem) => {
                torrent.label.push($(elem).text())
            })
            // 中文名称
            if ($(torrentInfo[0]).children('.optiontag').length > 0) {
                let lastText = $(torrentInfo[0]).children().last().text()
                torrent.chinese = $(torrentInfo[0]).text();
                torrent.chinese = torrent.chinese.substring(torrent.chinese.indexOf(lastText) + lastText.length)
            } else {
                torrent.chinese = $(torrentInfo[0]).html().split('<br>')[1];
            }
            // 下载链接
            torrent.download = $(torrentInfo[1]).children('table').children('tbody').children('tr').html().match(/[^"]+download.php[^"]+/g)[0].replace(/\&amp\;/g,'&')
            // 来源
            torrent.source = 'HDSky'
            // id
            torrent.uid = queryUrlParams(torrent.details, 'id')
            torrents.push(formatInfo(torrent));
        }
    }

    return torrents
}

module.exports = {
    HDFans,
    PTTime,
    MTeam,
    HDSky
}