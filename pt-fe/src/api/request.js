const request = (option) => {
    if (option.method === 'post') {
        option.body = JSON.stringify(option.data);
        option.headers = {
            'Content-Type': 'application/json'
        }
    }
    return fetch(option.url, option).then((response) => {
        if (response.status === 200) {
            // 返回的json字符串反序列化成对象,也被包装成一个Promise
            return response.json();
        }
        return Promise.resolve({ code: -99, msg: '网络异常，请重试' });
    })
}

export default request