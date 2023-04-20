import './index.css';
import Search from './Search';
import Listview from './Listview';
import { useTorrents, useMemo } from './hooks';
const Torrents = () => {
    const [list, submit, loading] = useTorrents();
    const datalist = useMemo(() => list, [list])
    return <div className='page-box'>
        <Search onSearch={submit} loading={loading}></Search>
        <Listview datalist={datalist}></Listview>
    </div>
}

export default Torrents