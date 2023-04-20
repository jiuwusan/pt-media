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
