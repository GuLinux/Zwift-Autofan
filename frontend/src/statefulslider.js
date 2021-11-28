import React, { useState } from "react";
import { Form, Tooltip, OverlayTrigger } from 'react-bootstrap';

export const StatefulSlider = ({onChange, onInput, serverValue, ...props}) => {
    const [localValue, setLocalValue] = useState(null);
    const [submitTimer, setSubmitTimer] = useState(false);
    
    const displayValue = () => localValue === null ? serverValue : localValue;
    const onLocalChanged = value => {
        if(onInput && ! onInput(value)) {
            return false;
        }
        setLocalValue(value);
        if(submitTimer) {
            clearTimeout(submitTimer);
        }
        setSubmitTimer(setTimeout(() => {
            onChange(value);
            setLocalValue(null);
        }, 1000));
    };
    return <OverlayTrigger
        placement='top'
        show={localValue!==null}
        overlay={<Tooltip>{displayValue()}</Tooltip>}
        >
        <Form.Range
            value={displayValue()}
            onInput={e => onLocalChanged(parseInt(e.target.value))}
            {...props}
        />
    </OverlayTrigger>
};
