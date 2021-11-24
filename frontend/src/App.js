import React, { useEffect } from "react";
import logo from './logo.png';
import './App.css';
import { Tab, Container, Navbar, Nav } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux'
import { setPath } from './app/navigationSlice';
import { fetchBackendStatus } from './app/backendSlice';
import { ZwiftPanel } from './zwift';
import { DashboardPanel } from './dashboard';
import { FanPanel } from './fan';
import { ButtonsPanel } from './buttons';
import { DebugPanel } from './debug';

const App = () => {
    const path = useSelector((state) => state.navigation.path)
    const dispatch = useDispatch()
    const isDevEnvironment = 'development' === process.env.NODE_ENV;
    const addDebugPanel = isDevEnvironment || new URLSearchParams(document.location.search.substring(1)).get('debug') === 'true';
    const setTab = tabKey => () => dispatch(setPath(tabKey));
    useEffect( () => {
        console.log('Registering fetch status hook');
        dispatch(fetchBackendStatus());
    }, [dispatch]);


    return <Tab.Container activeKey={path}>
        <Navbar bg='dark' variant='dark' expand='lg' collapseOnSelect className='mb-3'>
            <Container>
                <Navbar.Brand href='#home'>
                     <img alt='' src={logo} width='30' height='30' className='d-inline-block align-top' />{' '} Zwift-Autofan
                </Navbar.Brand>
                <Navbar.Toggle aria-controls='basic-navbar-nav' />
                <Navbar.Collapse id='basic-navbar-nav'>
                    <Nav>
                        <Nav.Item>
                            <Nav.Link href='#' onClick={setTab('dashboard')}>Dashboard</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href='#' onClick={setTab('zwift')}>Zwift</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href='#' onClick={setTab('fan')}>Fan</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href='#' onClick={setTab('buttons')}>Buttons</Nav.Link>
                        </Nav.Item>
                        { addDebugPanel &&
                        <Nav.Item>
                            <Nav.Link href='#' onClick={setTab('debug')}>Debug</Nav.Link>
                        </Nav.Item>
                        }
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
        <Container>
            <Tab.Content>
                <Tab.Pane eventKey='dashboard'>
                    <DashboardPanel />
                </Tab.Pane>
                <Tab.Pane eventKey='zwift'>
                    <ZwiftPanel />
                </Tab.Pane>
                <Tab.Pane eventKey='fan'>
                    <FanPanel />
                </Tab.Pane>
                <Tab.Pane eventKey='buttons'>
                    <ButtonsPanel />
                </Tab.Pane>
                { addDebugPanel &&
                <Tab.Pane eventKey='debug'>
                    <DebugPanel />
                </Tab.Pane>
                }
            </Tab.Content>
        </Container>
    </Tab.Container>
}
export default App;
