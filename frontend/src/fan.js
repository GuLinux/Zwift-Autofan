import React, { useState } from "react";
import { Badge, Form, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux'
import { setRelaySettings } from './app/backendSlice';
import { get } from 'lodash';

const RelayFan = () => {
    const dispatch = useDispatch()
    const interpolateSpeeds = useSelector((state) => get(state, 'backend.settings.relay_interpolate_speeds', false));
    const interpolateSpeedsOnOffTimes = useSelector((state) => get(state, 'backend.settings.relay_interpolate_blink_seconds', { on: 1, off: 1 }));
    const activeHigh = useSelector((state) => get(state, 'backend.settings.relay_active_high', false)); 
    const gpio = useSelector((state) => get(state, 'backend.settings.relay_gpio', []));
    const serverSettings = {
        relay_gpio: gpio,
        relay_active_high: activeHigh,
        relay_interpolate_speeds: interpolateSpeeds,
        relay_interpolate_blink_seconds: interpolateSpeedsOnOffTimes,
    };
    const [settings, setSettings] = useState({});
    
    const getSetting = () => ({...serverSettings, ...settings});

    const onSettingsChange = newSettings => {
        setSettings({...settings, ...newSettings});
    };

    const updateGPIOs = (index, value) => {
        let gpios = [...getSetting().relay_gpio];
        gpios[index] = value;
        onSettingsChange({relay_gpio: gpios});
    };
    
    const saveSettings = () => {
        dispatch(setRelaySettings(getSetting()));
        setSettings({});
    };

    const updateSpeeds = speeds => {
        setSettings({ relay_gpio: new Array(parseInt(speeds)).fill(null).map((v, i) => getSetting().relay_gpio[i] || serverSettings.relay_gpio[i] || 0 ) });
    }

    return <Form>
            <Form.Group>
                <Form.Label>
                    Fan Maximum speed
                </Form.Label>
                <Badge pill className="float-end mt-2">{getSetting().relay_gpio.length}</Badge>
                <Form.Range
                    value={getSetting().relay_gpio.length}
                    min={0}
                    max={10}
                    onInput={e => updateSpeeds(e.target.value)}
                />
            </Form.Group>
            <Form.Check id='relay_active_high' type='checkbox' label='GPIO active high' checked={getSetting().relay_active_high} onChange={e => onSettingsChange({relay_active_high: e.target.checked}) }/>
            <Form.Check id='relay_interpolate_speeds' type='checkbox' label='Double speed mode (interpolation)' checked={getSetting().relay_interpolate_speeds} onChange={e => onSettingsChange({relay_interpolate_speeds: e.target.checked}) }/>
            { getSetting().relay_interpolate_speeds &&
                <React.Fragment>
                    <Form.Group>
                        <Form.Label>Interpolate ON time</Form.Label>
                        <Badge pill className="float-end mt-2">{getSetting().relay_interpolate_blink_seconds.on}</Badge>
                        <Form.Range
                            value={getSetting().relay_interpolate_blink_seconds.on}
                            min={0}
                            max={10}
                            onInput={e => onSettingsChange({ relay_interpolate_blink_seconds: {...getSetting().relay_interpolate_blink_seconds, on: parseInt(e.target.value)} })}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Interpolate OFF time</Form.Label>
                        <Badge pill className="float-end mt-2">{getSetting().relay_interpolate_blink_seconds.off}</Badge>
                        <Form.Range
                            value={getSetting().relay_interpolate_blink_seconds.off}
                            min={0}
                            max={10}
                            onInput={e => onSettingsChange({ relay_interpolate_blink_seconds: {...getSetting().relay_interpolate_blink_seconds, off: parseInt(e.target.value)} })}
                        />
                    </Form.Group>
                </React.Fragment>
            }

            {getSetting().relay_gpio.map( (gpio, i) =>
                <Form.Group className="mb-3" key={`gpio_${i}`}>
                    <Form.Label>GPIO for speed {i+1}</Form.Label>
                    <Form.Control type='number' value={gpio} onChange={e => updateGPIOs(i, parseInt(e.target.value))}/>
                </Form.Group>
            )}
            <Button onClick={saveSettings}>Save settings</Button>
        </Form>
}

export const FanPanel = () => {
    return <RelayFan />
}


