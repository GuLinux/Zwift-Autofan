import React from "react";
import { Container, Alert } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux'
import { removeError } from './app/errorsSlice';

const Error = ({error, onDismiss}) => {
    let title;
    switch(error.error) {
        case 'bad_request':
            title = 'Invalid request';
            break;
        case 'zwift_login_error':
            title = 'Zwift login error';
            break;
        case 'zwift_monitor_error':
            title = 'Zwift monitoring error';
            break;
        default:
            title = 'Error';
    }
    return <Alert variant='danger' dismissible onClose={onDismiss} >
        <Alert.Heading>{title}</Alert.Heading>
        <p>{error.error_message}</p>
    </Alert>
}

export const Errors = () => {
    const errors = useSelector(state => state.errors);
    const dispatch = useDispatch()

    return <Container>
        {errors.map( (error, index) => <Error key={index} error={error} onDismiss={() => dispatch(removeError(index))} />)}
    </Container>
}

