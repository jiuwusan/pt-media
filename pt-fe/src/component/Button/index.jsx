import './index.css';
import { useThrottleFn } from 'ahooks';

const Button = (props) => {
    const { children, className = '', onClick = (v) => v, wait = 0, ...rest } = props;
    const { run: bindEvent } = useThrottleFn(onClick, {
        wait
    });

    return <button type="button" className={'default-button ' + className} {...rest} onClick={bindEvent}>{children}</button>
}

export default Button