import React, { useState } from "react";
import { Badge, Form, Button, Card } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux'
import { setLEDs } from './app/backendSlice';
import { get } from 'lodash';

const Led = ({ index, led, onChange }) => {
    const maxSpeed = useSelector((state) => get(state, 'backend.fan.max_speed', 0));
    return <Card className='mb-3'>
        <Card.Header>LED {index+1}</Card.Header>
        <Card.Body>
            <Form.Label>GPIO</Form.Label>
            <Form.Control type='number' value={led.gpio || 0} onChange={e => onChange(index, {...led, gpio: parseInt(e.target.value)})} />
            <Form.Label>On at speed:</Form.Label>
            <Badge pill className="float-end mt-2">{led.on_speed || 'Off'}</Badge>
            <Form.Range
                        className='mb-2'
                        onChange={e => onChange(index, {...led, on_speed: parseInt(e.target.value)})}
                        value={led.on_speed}
                        min={0}
                        max={maxSpeed}
            />
            <Form.Label>Slow blink at speed:</Form.Label>
            <Badge pill className="float-end mt-2">{led.slow_blink_speed || 'Off'}</Badge>
            <Form.Range
                        className='mb-2'
                        onChange={e => onChange(index, {...led, slow_blink_speed: parseInt(e.target.value)})}
                        value={led.slow_blink_speed || 0}
                        min={0}
                        max={maxSpeed}
            />
            <Form.Label>Fast blink at speed:</Form.Label>
            <Badge pill className="float-end mt-2">{led.fast_blink_speed || 'Off'}</Badge>
            <Form.Range
                        className='mb-2'
                        onChange={e => onChange(index, {...led, fast_blink_speed: parseInt(e.target.value)})}
                        value={led.fast_blink_speed || 0}
                        min={0}
                        max={maxSpeed}
            />
        </Card.Body>
    </Card>
}

export const LedsPanel = () => {
    const dispatch = useDispatch()
    const leds = useSelector((state) => get(state, 'backend.leds', []));
    const [localLeds, setLocalLeds] = useState(null);
    const displayLeds = () => localLeds === null ? leds : localLeds;
    
    const changeLocalLedsSize = length => {
        setLocalLeds(
            displayLeds().concat((new Array(length)).fill(null)).slice(0, length).map((e, i) => e || leds[i] || {})
        );
    }
    
    const changeLed = (index, led) => {
        let newLEDs = [...displayLeds()];
        newLEDs[index] = led;
        setLocalLeds(newLEDs);
    }
    
    const saveLEDs = async () => {
        await dispatch(setLEDs(displayLeds()));
        setLocalLeds(null);
    }
    
    return <Form>
        <Form.Group>
            <Form.Label>Leds</Form.Label>
            <Badge pill className="float-end mt-2">{displayLeds().length}</Badge>
            <Form.Range
                value={displayLeds().length}
                min={0}
                max={10}
                onInput={e => changeLocalLedsSize(e.target.value)}
            />
        </Form.Group>
        <Form.Group>
            { displayLeds().map((led, index) => <Led key={index} index={index} led={led} onChange={changeLed} />) }
        </Form.Group>
        <Form.Group>
            <Button onClick={saveLEDs}>Save changes</Button>
        </Form.Group>
    </Form>
}
