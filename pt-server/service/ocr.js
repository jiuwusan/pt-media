const axios = require('axios')

let ApiOcr = require('../SDK/ocr/index').ocr;

//设置APPID/AK/SK（前往百度云控制台创建应用后获取相关数据）
let APP_ID = "32546863";
let API_KEY = "BGukuSwbj7nlQyGBUa75fNAW";
let SECRET_KEY = "jB4wFu42fxBbRlLjRbSpxrsAo9UbeGfS";

let client = new ApiOcr(APP_ID, API_KEY, SECRET_KEY);

const loadImage = async (url) => {
    const res = await axios({
        url,
        responseType: 'arraybuffer'
    })
    return Buffer.from(res.data, 'binary').toString('base64')
}

/**
 * 识别文字
 * @param {*} base64Img 
 */
const accurateBasic = async (base64Img) => {
    let result = client.accurateBasic(base64Img);
    return result
}

/**
 * 识别文字
 * @param {*} base64Img 
 */
const accurateBasicUrl = async (url) => {
    let imageStr = await loadImage(url);
    let result = client.accurateBasic(imageStr);
    return result
}

/**
 * 识别图形验证码
 * @param {*} url 
 * @param {*} params 
 * @returns 
 */
const ocrImageCode = async (url) => {
    let rs = await accurateBasicUrl(url);
    let code = rs.words_result.reduce((prve, next) => {
        prve += next.words
        return prve
    }, '')
    code = (code.match(/[A-z\d]+/g) || []).join('')
    console.log('ocrImageCode--', code)
    return code
}

module.exports = {
    accurateBasic,
    accurateBasicUrl,
    ocrImageCode
}