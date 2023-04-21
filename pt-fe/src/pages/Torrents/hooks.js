import API from '../../api'
import { useState } from 'react'
export { useMemo } from 'react'
const { torrentsApi } = API


export const useTorrents = () => {
    const [datalist, setDatalist] = useState([]);
    const [loading, setLoading] = useState(false);

    const submit = async (search) => {
        if (loading) return // 上一次结果未返回
        setLoading(true)
        let rs = await torrentsApi.querylist({ search })
        if (rs.code === 0)
            setDatalist(rs.data)
        setLoading(false)
    }

    return [datalist, submit, loading]
}

export const useJellyfin = (data) => {
    let { download: url, source, uid } = data;
    const [loading, setLoading] = useState(false);

    const download = async () => {
        let rs = await torrentsApi.toJellyfin({ url: encodeURIComponent(url), source, uid })
        if (loading) return // 上一次结果未返回
        setLoading(true)
        if (rs.code === 0)
            // 添加成功
            window.alert('添加成功，正在下载中 ... ')
        setLoading(false)
    }

    return [loading, download]
}