import '../Alert.css';

export interface AlertProperty {
    msg : string;
    op_result : 'success' | 'fail';
    isVisible : boolean;
}

const Alert: React.FC<AlertProperty> = ({ msg, op_result, isVisible}) => {
    if(!isVisible){
        return null;
    }

    return (
        <div className = {`alert ${op_result}`}>
            {msg}
        </div>
    )
}

export default Alert;