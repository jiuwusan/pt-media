import Poster from './Poster'
import { Button } from '../../component'
import { useJellyfin } from './hooks';

const Torrent = (props) => {
    const { data: { year, mediaType, shortTitle, chinese, episode, season, source, label, download, uid } } = props

    //添加到jellyfin
    const [loading, toJellyfin] = useJellyfin({ download, uid, source })

    // 下载
    const handleDownload = () => {
        window.open(`/pt-api/download?url=${encodeURIComponent(download)}&source=${source}&uid=${uid}`);
    }

    return <div className="torrent-item">
        <Poster type={mediaType} title={shortTitle}></Poster>
        <div className='torrent-info'>
            <div className='torrent-info-title'>{shortTitle}{year ? `（${year}）` : ''}</div>
            <div className='torrent-info-row'>
                <span>{season}</span>
                <span>{episode}</span>
            </div>
            <div className='torrent-info-row'>
                <span>类型：{mediaType}</span>
                <span className={`torrent-source-${source}`}>{source}</span>
            </div>
            <div className='torrent-info-row torrent-label-list'>
                {label.map((val, idx) => <span key={val} className={`torrent-label`}>{val}</span>)}
            </div>
            <div className='torrent-info-row'>
                <Button className='torrent-option' onClick={handleDownload}>下载种子</Button>
                <Button className='torrent-option' onClick={toJellyfin} loading={loading}>To Jellyfin</Button>
            </div>
        </div>
    </div>
}

export default Torrent