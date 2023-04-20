import Poster from './Poster'
import { Button } from '../../component'

const Torrent = (props) => {
    const { data: { year, mediaType, shortTitle, chinese, episode, season, source, label, free, expires } } = props
    return <div className="torrent-item">
        <Poster type={mediaType} title={shortTitle}></Poster>
        <div className='torrent-info'>
            <div className='torrent-info-title'>{shortTitle}{year ? `（${year}）` : ''}</div>
            <div className='torrent-info-row'>
                <span>{season}</span>
                <span>{episode}</span>
            </div>
            <div className='torrent-info-row'>
                <span>{mediaType}</span>
                <span className={`torrent-source-${source}`}>{source}</span>
            </div>
            <div className='torrent-info-row'>{free ? (<><span>Free</span><span>expires</span></>) : ''}</div>
            <div className='torrent-info-row'>
                {label.map((val, idx) => <span key={val} className={`torrent-label-${idx}`}>{val}</span>)}
            </div>
            <div className='torrent-info-row'>
                <Button className='torrent-option'>下载种子</Button>
                <Button className='torrent-option'>To Jellyfin</Button>
            </div>
        </div>
    </div>
}

export default Torrent