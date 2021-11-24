import { createSlice } from '@reduxjs/toolkit'

const postJSON = (path, payload) => fetch(path, {
    method: 'POST',
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
});

export const backendSlice = createSlice({
    name: 'backend',
    initialState: { status: {} },
    reducers: {
        updateBackendStatus: (state, action) => {
            return {...action.payload };
        },
    },
});


export const { updateBackendStatus } = backendSlice.actions;
export const fetchBackendStatus = () => dispatch => {
    setInterval( async () => {
        const response = await fetch('/api/status');
        const json = await response.json();
        dispatch(updateBackendStatus(json));
    }, 2000);
}

export const zwiftLogin = (username, password) => async dispatch => {
    const response = await postJSON('/api/zwift/login', { username, password });
    const json = await response.json();
    dispatch(updateBackendStatus(json));
}

export const zwiftLogout = () => async dispatch => {
    const response = await fetch('/api/zwift/logout', { method: 'POST' });
    const json = await response.json();
    dispatch(updateBackendStatus(json));
}

export const setZwiftMode = (mode) => async dispatch => {
    const response = await fetch(`/api/settings/mode/${mode}`, { method: 'POST' });
    const json = await response.json();
    dispatch(updateBackendStatus(json));
}

export const setZwiftThresholds = (mode, thresholds) => async dispatch => {
    const response = await postJSON(`/api/settings/mode/${mode}`, { [`${mode}_thresholds`]: thresholds });
    const json = await response.json();
    dispatch(updateBackendStatus(json));
}

export const startZwiftMonitor = () => async dispatch => {
    const response = await fetch(`/api/zwift/monitor/start`, { method: 'POST' });
    const json = await response.json();
    dispatch(updateBackendStatus(json));
}

export const stopZwiftMonitor = () => async dispatch => {
    const response = await fetch(`/api/zwift/monitor/stop`, { method: 'POST' });
    const json = await response.json();
    dispatch(updateBackendStatus(json));
}

export const setFanSpeed = speed => async dispatch => {
    const response = await fetch(`/api/fan/speed/${speed}`, { method: 'POST' });
    const json = await response.json();
    dispatch(updateBackendStatus(json));
}

export const setRelaySettings = settings => async dispatch => {
    const response = await postJSON(`/api/settings/fan/relay`, settings );
    const json = await response.json();
    dispatch(updateBackendStatus(json));
}


export const setButtonsMode = mode => async dispatch => {
    const response = await fetch(`/api/settings/physical_buttons/${mode}`, { method: 'POST' });
    const json = await response.json();
    dispatch(updateBackendStatus(json));
}

export const setButtonsGPIOs = (mode, gpios) => async dispatch => {
    const response = await postJSON(`/api/settings/physical_buttons/${mode}`, gpios);
    const json = await response.json();
    dispatch(updateBackendStatus(json));
}

export const setZwiftBias = bias => async dispatch => {
    const response = await postJSON(`/api/settings/zwift-monitor-bias`, { bias });
    const json = await response.json();
    dispatch(updateBackendStatus(json));
}



export default backendSlice.reducer;
