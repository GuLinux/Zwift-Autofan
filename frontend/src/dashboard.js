import React from "react";
import { Form, ProgressBar, Badge, ListGroup, Card, Button, Container } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux'
import { setFanSpeed, startZwiftMonitor, stopZwiftMonitor } from './app/backendSlice';
import { setPath } from './app/navigationSlice';
import { get } from 'lodash';


const ZwiftLoggedOut = () => {
    const dispatch = useDispatch()
    return <React.Fragment>
        <p>Login to Zwift first.</p>
        <Button onClick={() => dispatch(setPath('zwift'))}>Login</Button>
    </React.Fragment>
};

const ZwiftDashboard = () => {
    const dispatch = useDispatch()
    const zwiftOnline = useSelector((state) => get(state, 'backend.zwift.online', false));
    const zwiftMonitoring = useSelector((state) => get(state, 'backend.monitor.is_running', false));
    const zwiftUserId = useSelector((state) => get(state, 'backend.zwift.user_id'));
    const zwiftSpeed = useSelector((state) => get(state, 'backend.zwift.speed', 0));
    const zwiftHeartrate = useSelector((state) => get(state, 'backend.zwift.heart_rate', 0));
    const zwiftPower = useSelector((state) => get(state, 'backend.zwift.power', 0));
    return <ListGroup>
        <ListGroup.Item>
            <span>Zwift fan monitor: <Badge bg={zwiftMonitoring ? 'success' : 'danger'} className='ms-2'>{zwiftMonitoring ? 'running' : 'stopped'}</Badge></span>
            {zwiftMonitoring ?
                <Button variant='danger' className='float-end' onClick={() => dispatch(stopZwiftMonitor())}>Stop</Button> :
                <Button className='float-end' variant='success' onClick={() => dispatch(startZwiftMonitor())}>Start</Button>}
        </ListGroup.Item>
        { zwiftMonitoring && <ListGroup.Item>
                Zwift user: <i>{zwiftUserId}</i> 
                <Badge bg={zwiftOnline ? 'success' : 'danger'} className='ms-2'>{zwiftOnline ? 'Online' : 'Offline'}</Badge>
            </ListGroup.Item>
        }
        { /*zwiftMonitoring && */zwiftOnline && <React.Fragment>
            <ListGroup.Item>
                Speed
                <ProgressBar now={zwiftSpeed} max={120} label={`${Math.round(zwiftSpeed)} KM/h`} />
                { zwiftHeartrate > 0 && <span>Heart rate<ProgressBar now={zwiftHeartrate} max={220} label={`${zwiftHeartrate} bpm`} /></span> }
                { zwiftPower > 0 && <span>Power <ProgressBar now={zwiftPower} max={1500} label={`${zwiftPower} Watts`} /></span> }
            </ListGroup.Item>
            {/*
            <ListGroup.Item>
                <Form.Group>
                    <Form.Label>
                        Triggers bias
                    </Form.Label>
                    <Badge pill className="float-end mt-2">0</Badge>
                    <Form.Range
                        min={-100}
                        max={100}
                        onInput={e => console.log(parseInt(e.target.value))}
                    />
                </Form.Group>
            </ListGroup.Item>
            */}
        </React.Fragment>
        }
    </ListGroup>
};

const FanDashboard = () => {
    const dispatch = useDispatch()
    const fanMaxSpeed = useSelector((state) => get(state, 'backend.fan.max_speed', 0));
    const fanSpeed = useSelector((state) => get(state, 'backend.fan.speed', 0));
    return fanMaxSpeed > 0 ? <ListGroup>
        <ListGroup.Item>
            Fan Speed
            <ProgressBar now={fanSpeed} max={fanMaxSpeed} label={`${fanSpeed}/${fanMaxSpeed}`} />
        </ListGroup.Item>
        <ListGroup.Item>
            Set speed manually
            <div className="d-grid gap-2">
                {[...Array(fanMaxSpeed+1)].map( (x, i) =>
                    <Button
                    key={`fanSpeed-${i}`}
                    size='lg'
                    variant={fanSpeed === i ? 'success' : 'secondary'}
                    active={fanSpeed === i}
                    onClick={() => dispatch(setFanSpeed(i))}>
                        {i}
                    </Button>)}
            </div>
        </ListGroup.Item>
    </ListGroup> : '';

}

export const DashboardPanel = () => {
    const zwiftLoggedIn = useSelector((state) => get(state, 'backend.zwift.login', false));
    return <Container>
        <Card className='mb-3'>
            <Card.Header><h4>Zwift</h4></Card.Header>
            <Card.Body>
                { zwiftLoggedIn || <ZwiftLoggedOut /> }
                { zwiftLoggedIn && <ZwiftDashboard /> }
            </Card.Body>
        </Card>
        <Card className='mb-3'>
            <Card.Header><h4>Fan</h4></Card.Header>
            <Card.Body>
                <FanDashboard />
            </Card.Body>
        </Card>

    </Container>
}
