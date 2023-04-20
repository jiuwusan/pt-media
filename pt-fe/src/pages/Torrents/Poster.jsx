import { useMemo } from 'react'

const Poster = (props) => {
    const { type, title } = props
    const posterUrl = useMemo(() => {
        return `/pt-api/poster?keyword=${title}&type=${type}`
    }, [type, title])
    return <img src={posterUrl} alt={posterUrl} className='torrent-poster'/>
}

export default Poster