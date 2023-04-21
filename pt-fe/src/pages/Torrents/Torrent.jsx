import Poster from './Poster'
import { Button } from '../../component'
import { useJellyfin } from './hooks';

const Torrent = (props) => {
    const { data: { poster, category, year, mediaType, shortTitle, episode, season, source, label, download, uid, resolution, seeding } } = props

    //添加到jellyfin
    const [loading, toJellyfin] = useJellyfin({ download, uid, source, category })

    // 下载
    const handleDownload = () => {
        window.open(`/pt-api/download?url=${encodeURIComponent(download)}&source=${source}&uid=${uid}`);
    }

    return <div className="torrent-item">
        <Poster poster={poster}></Poster>
        <div className='torrent-info'>
            <div className='torrent-info-title'>{shortTitle}{year ? `（${year}）` : ''}</div>
            <div className='torrent-info-row'>
                {episode && <span>{season}/</span>}
                {episode && <span>{episode}</span>}
            </div>
            <div className='torrent-info-row'>
                <span>{mediaType}</span>
                <span className={`torrent-source-${source}`}>{source}</span>
            </div>
            <div className='torrent-info-row torrent-label-list'>
                {resolution && <span className='torrent-label'>{resolution}</span>}
                {label.map((val, idx) => <span key={val} className='torrent-label'>{val}</span>)}
            </div>
            <div className='torrent-info-row'>
                <Button className='torrent-option' onClick={handleDownload}>下载种子({seeding})</Button>
                <Button className='torrent-option' onClick={toJellyfin} loading={loading}>To Jellyfin</Button>
            </div>
        </div>
    </div>
}

export default Torrent