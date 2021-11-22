import React, { useState } from "react";
import { Badge, FloatingLabel, Form, Button, Container } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux'
import { setRelaySettings } from './app/backendSlice';
import { get } from 'lodash';

const RelayFan = () => {
    const dispatch = useDispatch()
    const maxSpeed = useSelector((state) => get(state, 'backend.settings.speeds', 0));
    const activeHigh = useSelector((state) => get(state, 'backend.settings.relay_active_high', false)); 
    const gpio = useSelector((state) => get(state, 'backend.settings.relay_gpio', []));
    const serverSettings = {
        relay_gpio: gpio,
        relay_active_high: activeHigh,
        speeds: maxSpeed,
    };
    const [settings, setSettings] = useState({});
    
    const getSetting = () => ({...serverSettings, ...settings});

    const onSettingsChange = newSettings => {
        setSettings({...settings, ...newSettings});
    };

    const updateGPIOs = (index, value) => {
        let gpios = [...settings.relay_gpio];
        gpios.length = settings.speeds;
        gpios[index] = value;
        onSettingsChange({relay_gpio: gpios});
    };
    
    const saveSettings = () => {
        dispatch(setRelaySettings(getSetting()));
        setSettings({});
    };

    return <Form>
            <Form.Group>
                <Form.Label>
                    Fan Maximum speed
                </Form.Label>
                <Badge pill className="float-end mt-2">{getSetting().speeds}</Badge>
                <Form.Range
                    value={getSetting().speeds}
                    min={0}
                    max={10}
                    onInput={e => onSettingsChange({speeds: parseInt(e.target.value)})}
                />
            </Form.Group>
            <Form.Check id='relay_active_high' type='checkbox' label='GPIO active high' checked={getSetting().relay_active_high} onChange={e => onSettingsChange({relay_active_high: e.target.checked}) }/>
            {[...Array(getSetting().speeds)].map( (x, i) =>
                <Form.Group className="mb-3" key={`gpio_${i}`}>
                    <Form.Label>GPIO for speed {i+1}</Form.Label>
                    <Form.Control type='number' value={get(getSetting(), `relay_gpio[${i}]`, 0)} onChange={e => updateGPIOs(i, e.target.value)}/>
                </Form.Group>
            )}
            <Button onClick={saveSettings}>Save settings</Button>
        </Form>
}

export const FanPanel = () => {
    return <RelayFan />
}


