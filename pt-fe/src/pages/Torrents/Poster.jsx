import { useMemo } from 'react'

const Poster = (props) => {
    const { poster } = props
    const posterUrl = useMemo(() => ((!(/^https?:\/\/.+/g).test(poster)) ? ('/pt-api' + poster) : poster), [poster])
    return <img src={posterUrl} alt={posterUrl} className='torrent-poster' />
}

export default Poster