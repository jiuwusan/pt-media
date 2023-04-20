const request = (option) => {
    if (option.method === 'post') {
        option.body = JSON.stringify(option.data);
        option.headers = {
            'Content-Type': 'application/json'
        }
    } else if (option.method === 'get' && option.params) {
        for (const key in option.params) {
            option.url = option.url + (option.url.indexOf('?') > -1 ? '&' : '?') + `${key}=${option.params[key]}`
        }
    }
    console.log(option)
    return fetch(option.url, option).then((response) => {
        if (response.status === 200) {
            // 返回的json字符串反序列化成对象,也被包装成一个Promise
            return response.json();
        }
        return Promise.resolve({ code: -99, msg: '网络异常，请重试' });
    })
}

export default request