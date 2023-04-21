const request = require('./request')
const cheerio = require('cheerio')

// 海报缓存
let posterCache = {}

/**
 * 获取 海报
 * @param {*} keywork 
 */
const getPoster = async (keyword = '', type = 'tv', defaultPoster) => {
    if (!keyword.match(/[\u4e00-\u9fa5]+/g)) return '';
    let cacheKey = encodeURIComponent(keyword);
    // 优先都缓存
    if (posterCache[cacheKey]) return posterCache[cacheKey];
    // 存在 poster 则 不爬取
    if (defaultPoster) {
        posterCache[cacheKey] = defaultPoster;
        return defaultPoster
    }
    // 开始进行爬虫加载
    const tmdbhost = 'https://www.themoviedb.org';
    const imagehost = 'https://image.tmdb.org';
    let cookie = `tmdb.prefs=%7B%22adult%22%3Afalse%2C%22i18n_fallback_language%22%3A%22en-US%22%2C%22locale%22%3A%22zh-CN%22%2C%22country_code%22%3A%22SG%22%2C%22timezone%22%3A%22Asia%2FSingapore%22%7D;`
    const { data } = await request.browser(`${tmdbhost}/search?query=${encodeURIComponent(keyword)}`, cookie)
    const $ = await cheerio.load(data);
    let posterUrl = '';
    let tvPoster = $('.search_results .tv').find('img').attr('src')
    let moviePoster = $('.search_results .movie').find('img').attr('src')
    $('.search_results .movie').find('img').attr('src')

    if (type.match(/(tv)|视/gi))
        posterUrl = tvPoster
    else if (type.match(/(movie)|影/gi))
        posterUrl = moviePoster
    else
        posterUrl = tvPoster || moviePoster || ''
    if (posterUrl) {
        posterUrl = imagehost + posterUrl.replace(/w\d+_[^\/]+/g, 'w300_and_h450_bestv2');
        posterCache[cacheKey] = posterUrl;
    }
    request.sleep(200)
    return posterUrl
}

/**
 * 获取 信息
 * @param {*} keywork 
 */
const getInfo = async (keyword = '', type = 'tv') => {
    if (!keyword) return '';
    let cacheKey = encodeURIComponent(`${type}_${keyword}`);
    // 优先都缓存
    if (posterCache[cacheKey]) return posterCache[cacheKey];
    console.log('获取海报--', cacheKey, posterCache)
    // 开始进行爬虫加载
    const tmdbhost = 'https://www.themoviedb.org';
    let cookie = `tmdb.prefs=%7B%22adult%22%3Afalse%2C%22i18n_fallback_language%22%3A%22en-US%22%2C%22locale%22%3A%22zh-CN%22%2C%22country_code%22%3A%22SG%22%2C%22timezone%22%3A%22Asia%2FSingapore%22%7D;`
    const { data } = await request.browser(`${tmdbhost}/search?query=${encodeURIComponent(keyword)}`, cookie)
    const $ = await cheerio.load(data);
    let posterUrl = '';
    let tvPoster = $('.search_results .tv').find('img').attr('src')
    let moviePoster = $('.search_results .movie').find('img').attr('src')
    $('.search_results .movie').find('img').attr('src')

    if (type.match(/(tv)|视/gi))
        posterUrl = $('.search_results .tv').find('img').attr('src')
    else if (type.match(/(movie)|影/gi))
        posterUrl = $('.search_results .movie').find('img').attr('src')
    else
        posterUrl = tvPoster || moviePoster || ''
    if (posterUrl) {
        // posterUrl = tmdbhost + posterUrl.replace(/w\d+.*h\d+[^\/]+/g, 'w300_and_h450_bestv2');
        posterCache[cacheKey] = posterUrl;
    }
    return posterUrl
}

module.exports = {
    getPoster,
    getInfo
}