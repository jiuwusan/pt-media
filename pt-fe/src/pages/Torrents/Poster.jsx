import { useMemo } from 'react'

const Poster = (props) => {
    const { poster } = props
    const posterUrl = useMemo(() => poster, [poster])
    return <img src={posterUrl} alt={posterUrl} className='torrent-poster' />
}

export default Poster