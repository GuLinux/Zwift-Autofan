import React, { useState } from "react";
import { FloatingLabel, Form, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux'
import { setButtonsMode, setButtonsGPIOs } from './app/backendSlice';
import { get } from 'lodash';

const CycleButtonSettings = ({cycle_button_gpio, onChange}) => {
    return <Form.Group className="mb-3">
        <Form.Label>Change speed button GPIO</Form.Label>
        <Form.Control type='number' value={cycle_button_gpio} onChange={e => onChange({cycle_button_gpio: parseInt(e.target.value)})}/>
    </Form.Group>
};

const UpDownButtonsSettings = ({up_button_gpio, down_button_gpio, onChange}) => {
    return <React.Fragment>
        <Form.Group className="mb-3">
            <Form.Label>Speed Up button GPIO</Form.Label>
            <Form.Control type='number' value={up_button_gpio} onChange={e => onChange({up_button_gpio: parseInt(e.target.value)})}/>
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label>Speed Down button GPIO</Form.Label>
            <Form.Control type='number' value={down_button_gpio} onChange={e => onChange({down_button_gpio: parseInt(e.target.value)})}/>
        </Form.Group>
    </React.Fragment>
};

const SpeedsButtonsSettings = ({speeds, speeds_buttons_gpio, onChange}) => {
    const changeSpeedGPIO = (index, value) => {
        let speedGPIOs = [...speeds_buttons_gpio];
        speedGPIOs[index] = value;
        onChange({speeds_buttons_gpio: speedGPIOs});
    };
    return <React.Fragment>
        {[...Array(speeds+1)].map( (x, i) =>
            <Form.Group className="mb-3" key={`gpio_${i}`}>
                <Form.Label>Speed {i} button GPIO</Form.Label>
                <Form.Control type='number' value={speeds_buttons_gpio[i]} onChange={e => changeSpeedGPIO(i, e.target.value)}/>
            </Form.Group>
        )}
    </React.Fragment>
}

export const ButtonsPanel = () => {
    const dispatch = useDispatch()
    const buttonsMode = useSelector((state) => get(state, 'backend.settings.physical_buttons', 'none'));
    const [localButtonsGPIOs, setLocalButtonsGPIOs] = useState({});
    const cycle_button_gpio = useSelector((state) => get(state, 'backend.settings.cycle_button_gpio', 0));
    const up_button_gpio = useSelector((state) => get(state, 'backend.settings.up_button_gpio', 0));
    const down_button_gpio = useSelector((state) => get(state, 'backend.settings.down_button_gpio', 0));
    const maxSpeed = useSelector((state) => get(state, 'backend.fan.max_speed', 0));
    const speeds_buttons_gpio = useSelector((state) => get(state, 'backend.settings.speeds_buttons_gpio', []));
    
    const getMergedSettings = () => ({
        cycle_button_gpio: cycle_button_gpio,
        up_button_gpio,
        down_button_gpio,
        speeds_buttons_gpio,
        ...localButtonsGPIOs,
    });
    
    const saveSettings = () => {
        dispatch(setButtonsGPIOs(buttonsMode, getMergedSettings()));
        setLocalButtonsGPIOs({});
    };

    const mergeLocalButtonsGPIOs = settings => setLocalButtonsGPIOs({...localButtonsGPIOs, ...settings});

    return <Form>
        <FloatingLabel controlId="buttonsMode" label="Buttons mode" className='mb-3'>
            <Form.Select value={buttonsMode} onChange={e => dispatch(setButtonsMode(e.target.value))} >
                <option value='none'>No buttons</option>
                <option value='cycle'>Single button (cycle through all speeds)</option>
                <option value="up-down">Two buttons (up/down)</option>
                <option value="speeds">One button for each speed settings</option>
            </Form.Select>
        </FloatingLabel>
        { buttonsMode === 'cycle' && <CycleButtonSettings cycle_button_gpio={getMergedSettings().cycle_button_gpio} onChange={mergeLocalButtonsGPIOs} /> }
        { buttonsMode === 'up-down' && <UpDownButtonsSettings up_button_gpio={getMergedSettings().up_button_gpio} down_button_gpio={getMergedSettings().down_button_gpio} onChange={mergeLocalButtonsGPIOs} /> }
        { buttonsMode === 'speeds' && <SpeedsButtonsSettings speeds={maxSpeed} speeds_buttons_gpio={getMergedSettings().speeds_buttons_gpio} onChange={mergeLocalButtonsGPIOs} s/> }
        { buttonsMode !== 'none' && <Button onClick={saveSettings}>Save settings</Button> }
    </Form>
}
