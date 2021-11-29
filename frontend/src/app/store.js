import { configureStore } from '@reduxjs/toolkit';
import navigationReducer from './navigationSlice';
import backendReducer from './backendSlice';
import errorsReducer from './errorsSlice';
//import logger from 'redux-logger'


export const store = configureStore({
    reducer: {
        navigation: navigationReducer,
        backend: backendReducer,
        errors: errorsReducer,
    },
    devTools: true,
//    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

