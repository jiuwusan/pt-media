import Torrent from './Torrent';

const Listview = (props) => {
    const { datalist } = props

    return <div className="torrent-list">
        <div className='torrent-list-body'>
            {
                datalist.map((item) => <Torrent key={item.uid} data={item}></Torrent>)
            }
        </div>
    </div>
}

export default Listview