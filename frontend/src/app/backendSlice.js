import { createSlice } from '@reduxjs/toolkit';
import { appendError } from './errorsSlice';

export const backendSlice = createSlice({
    name: 'backend',
    initialState: { loading: true },
    reducers: {
        updateBackendStatus: (state, action) => {
            return {...action.payload, loading: false };
        },
    },
});


export const { updateBackendStatus } = backendSlice.actions;


export const fetchBackend = async (dispatch, path, method, payload) => {
    let options = { method };
    if(payload) {
        options.headers = { 'content-type': 'application/json' };
        options.body = JSON.stringify(payload);
    }
    const response = await fetch(path, options);
    const json = await response.json();
    if('error' in json) {
        dispatch(appendError(json));
    }
    return json
}

export const getBackend = async (dispatch, path) => await fetchBackend(dispatch, path, 'GET');
export const postBackend = async (dispatch, path, payload) => await fetchBackend(dispatch, path, 'POST', payload);



export const fetchBackendStatus = () => dispatch => {
    setInterval( async () => {
        dispatch(updateBackendStatus(await getBackend(dispatch, '/api/status')));
    }, 2000);
}

export const zwiftLogin = (username, password) => async dispatch => {
    const response = await postBackend(dispatch, '/api/zwift/login', {username, password});
    dispatch(updateBackendStatus(response));
}

export const zwiftLogout = () => async dispatch => {
    const response = await postBackend(dispatch, '/api/zwift/logout');
    dispatch(updateBackendStatus(response));
}

export const setZwiftMode = (mode) => async dispatch => {
    const response = await postBackend(dispatch, `/api/settings/mode/${mode}`);
    dispatch(updateBackendStatus(response));
}

export const setZwiftThresholds = (mode, thresholds) => async dispatch => {
    const response = await postBackend(dispatch, `/api/settings/mode/${mode}`, { [`${mode}_thresholds`]: thresholds });
    dispatch(updateBackendStatus(response));
}

export const startZwiftMonitor = () => async dispatch => {
    const response = await postBackend(dispatch, `/api/zwift/monitor/start`);
    dispatch(updateBackendStatus(response));
}

export const stopZwiftMonitor = () => async dispatch => {
    const response = await postBackend(dispatch, `/api/zwift/monitor/stop`);
    dispatch(updateBackendStatus(response));
}

export const setFanSpeed = speed => async dispatch => {
    const response = await postBackend(dispatch, `/api/fan/speed/${speed}`);
    dispatch(updateBackendStatus(response));
}

export const setRelaySettings = settings => async dispatch => {
    const response = await postBackend(dispatch, `/api/settings/fan/relay`, settings );
    dispatch(updateBackendStatus(response));
}


export const setButtonsMode = mode => async dispatch => {
    const response = await postBackend(dispatch, `/api/settings/physical_buttons/${mode}`);
    dispatch(updateBackendStatus(response));
}

export const setButtonsGPIOs = (mode, gpios) => async dispatch => {
    const response = await postBackend(dispatch, `/api/settings/physical_buttons/${mode}`, gpios);
    dispatch(updateBackendStatus(response));
}

export const setZwiftBias = bias => async dispatch => {
    const response = await postBackend(dispatch, `/api/settings/zwift-monitor-bias`, { bias });
    dispatch(updateBackendStatus(response));
}

export const setLEDs = leds => async dispatch => {
    const response = await postBackend(dispatch, `/api/settings/leds`, { leds });
    dispatch(updateBackendStatus(response));
}

export default backendSlice.reducer;
