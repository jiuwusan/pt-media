import ApiGenerator from './ApiGenerator'
import request from './request'

const { genApi } = new ApiGenerator(request, '', (config) => {
    return config
}, (res) => {
    if (res.code !== 0) {
        // 错误处理
    }
    return res
});

/**
 * Api 字典
 */
const torrentsApi = genApi({
    // 获取列表
    querylist: '/pt-api/torrents'
})

const API = {
    torrentsApi
}

export default API