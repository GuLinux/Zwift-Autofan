import { configureStore } from '@reduxjs/toolkit';
import navigationReducer from './navigationSlice';
import backendReducer from './backendSlice';
import logger from 'redux-logger'


export const store = configureStore({
    reducer: {
        navigation: navigationReducer,
        backend: backendReducer,
    },
    devTools: true,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

