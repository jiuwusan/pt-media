import './index.css';
import { useThrottleFn } from 'ahooks';
import LoadingIcon from './assets/loading.svg'

const Button = (props) => {
    const { children, className = '', onClick = (v) => v, wait = 0, loading, ...rest } = props;
    const { run: bindEvent } = useThrottleFn(onClick, {
        wait
    });

    return <button type="button" className={'default-button ' + className} {...rest} onClick={bindEvent}>
        {loading && <span>
            <img className='btn-loading' src={LoadingIcon} alt="loading" />
        </span>}
        <span>{children}</span>
    </button>
}

export default Button