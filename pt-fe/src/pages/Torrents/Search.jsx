import { Button } from '../../component'
import { useRef } from 'react'

const Search = (props) => {
    const { onSearch, loading } = props
    const InputDom = useRef();
    const handleClick = () => {
        let value = InputDom.current.value;
        onSearch && onSearch(value)
    }
    return <div className="seach-box">
        <div className="seach-box-fixed">
            <input ref={InputDom} type="text" className='seach-input' placeholder='请输入关键词' />
            <Button onClick={handleClick} className='search-btn'>搜索{loading && '中'}</Button>
        </div>
    </div>
}

export default Search