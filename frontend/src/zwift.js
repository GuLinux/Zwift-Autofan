import React, { useState } from "react";
import { Badge, FloatingLabel, Form, Button, Container } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux'
import { zwiftLogin, zwiftLogout, setZwiftMode, setZwiftThresholds } from './app/backendSlice';
import { get } from 'lodash';
import { StatefulSlider } from './statefulslider';



const ZwiftTriggers = () => {
    const dispatch = useDispatch()
    const monitoringMode = useSelector((state) => get(state, 'backend.settings.mode', 'manual'));
    const fanTriggers = useSelector((state) => get(state, 'backend.settings.speeds', 0));
    const thresholds = useSelector((state) => get(state, `backend.settings.${monitoringMode}_thresholds`, []));
    const validateThresholdChanges = (index, value) => {
        if(index > 0 && value <= thresholds[index-1]) {
            return false;
        }
        if(index < (thresholds.length-1) && value >= thresholds[index+1]) {
            return false;
        }
        return true;
    }
    const onChangedThreshold = async (index, value) => {
        if(!validateThresholdChanges(index, value)) {
            return;
        }
        let newThresholds = [...thresholds];
        newThresholds[index] = value;
        await dispatch(setZwiftThresholds(monitoringMode, newThresholds));
    };

    const minMax = {
        heartrate: { min: 30, max: 250 },
        speed: { min: 0, max: 100 },
        power: { min: 0, max: 999 },
    };
    
    return <Container className='mt-3'>
        {[...Array(fanTriggers)].map( (x, i) =>
            <Form.Group key={i}>
                <Form.Label>
                    Fan Speed {i+1}
                </Form.Label>
                <Badge pill className="float-end mt-2">{thresholds[i]}</Badge>
                <StatefulSlider
                    serverValue={thresholds[i]}
                    min={get(minMax, [monitoringMode, 'min'])}
                    max={get(minMax, [monitoringMode, 'max'])}
                    onInput={v => validateThresholdChanges(i, v)}
                    onChange={async v => onChangedThreshold(i, v)}
                />
            </Form.Group>
        )}
    </Container>
}

const ZwiftLogin = () => {
    const dispatch = useDispatch()
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return <Container>
        <h2>Login to Zwift</h2>
        <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" onChange={e => setUsername(e.target.value)}/>
                    <Form.Text className="text-muted">
                        We'll never share your email with anyone else.
                    </Form.Text>
                </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" onChange={e => setPassword(e.target.value)}/>
            </Form.Group>
            <Button variant="primary" onClick={() => dispatch(zwiftLogin(username, password))}>Login</Button>
        </Form>
    </Container>
}

const ZwiftSettings = () => { 
    const dispatch = useDispatch()
    const monitoringMode = useSelector((state) => get(state, 'backend.settings.mode', 'manual'));
    const userId = useSelector((state) => get(state, 'backend.settings.zwift_user_id'));
    return <Container>

        <Form>
            <FloatingLabel controlId="zwiftMonitoringMode" label="Zwift monitoring mode">
                <Form.Select value={monitoringMode} onChange={e => dispatch(setZwiftMode(e.target.value))} >
                    <option value='manual'>Manual</option>
                    <option value='heartrate'>Heart rate</option>
                    <option value="speed">Speed</option>
                    <option value="power">Power</option>
                </Form.Select>
            </FloatingLabel>
            { monitoringMode !== 'manual' && <ZwiftTriggers key={monitoringMode} />}
        </Form>
        Zwift User ID: {userId}
            <Button variant="warning" className='float-end' onClick={() => dispatch(zwiftLogout())}>Logout</Button>
    </Container>
}

export const ZwiftPanel = () => {
    const loggedIn = useSelector((state) => get(state, 'backend.zwift.login', false));
    if(loggedIn) {
        return <ZwiftSettings />
    }
    return <ZwiftLogin />
}

