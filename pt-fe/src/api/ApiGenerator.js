/**
 * Api 构造器
 */
export default class ApiGenerator {
    /**
     * 
     * @param {*} baseURL 根路径
     * @param {*} dicts 字典，一个数组
     * @param {*} transformRequest 修改请求数据 (config)=>{}
     * @param {*} transformResponse 修改响应数据 (res)=>{}
     */
    constructor(instance, baseURL, transformRequest, transformResponse) {

        if (typeof instance === 'string') {
            // 参数前置
            transformResponse = transformRequest;
            transformRequest = baseURL;
            baseURL = instance
        }

        this.baseURL = baseURL;
        this.instance = instance;
        this.transformRequest = transformRequest;
        this.transformResponse = transformResponse;
        // 请求锁
        this.apiLock = {};
    }

    /**
     * 处理参数
     * @param {*} api 
     * @returns 
     */
    analytical = (api) => {
        let option;
        switch (Object.prototype.toString.call(api)) {
            case '[object Object]':
                option = api;
                break;
            case '[object String]':
                let apiArr = api.replace(/\ +/g, ' ').split(' ');
                switch (apiArr.length) {
                    case 1:
                        option = { method: 'get', url: apiArr[0] }
                        break;
                    case 2:
                        option = { method: apiArr[0], url: apiArr[1] }
                        break;
                }
                break;
        }

        if (!option)
            throw new Error(`${api} --> 参数异常`)

        option.method = option.method.toLowerCase();

        return (data = {}, params = {}) => {

            let config = { ...option, data, params };

            if (config.method === 'get') {
                config.params = data;
                config.data = {};
            }

            // 替换 :params
            let matchArr = config.url.match(/:[^/?]+/g);
            // 拼接
            if (!/^http.*/.test(config.url)) config.url = this.baseURL + config.url;
            // 防止 出现 ^// 
            if (!/^\/\/.*/.test(config.url)) config.url = config.url.replace(/\/\//, '/');
            this.transformRequest && (config = this.transformRequest(config))

            // let lockKey = JSON.stringify(config);
            let lockKey = config.url;
            if (this.apiLock[lockKey]) {
                return Promise.resolve({ code: -98, msg: '操作太频繁 ！！！' });
            }
            this.apiLock[lockKey] = true;
            let reTry = 0;

            const request = (opt) => {
                return new Promise((resolve) => {
                    this.instance(opt).then((res) => {
                        this.transformResponse && (res = this.transformResponse(res));
                        resolve(res);
                    }).catch(() => {
                        if (reTry < 3) {
                            reTry++;
                            console.log(`${opt.url} 第 ${reTry} 次尝试重连`);
                            resolve(request(opt));
                        } else {
                            let errMsg = { data: { code: -99, msg: '网络异常，请重试' } };
                            this.transformResponse && (errMsg = this.transformResponse(errMsg))
                            resolve(errMsg);
                        }
                    }).finally(() => {
                        delete this.apiLock[lockKey]
                    })
                })
            }

            return request(config)
        }
    }

    genApi = (apis) => {
        const API = {};

        if (Object.prototype.toString.call(apis) === '[object Object]')
            //开始构建
            for (const key in apis) {
                if (Object.hasOwnProperty.call(apis, key)) {
                    API[key] = this.analytical(apis[key])
                }
            }

        return API
    }
}