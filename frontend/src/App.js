import React, { useState } from "react";
import logo from './logo.svg';
import './App.css';
import { Tab, Container, Navbar, Nav } from 'react-bootstrap';

const App = () => {
    const [activeKey, setActiveKey] = useState("dashboard");
    const setTab = tabKey => () => setActiveKey(tabKey);

    return <Tab.Container activeKey={activeKey}>
        <Navbar bg='dark' variant='dark' expand='lg'>
            <Container>
                <Navbar.Brand href='#home'>
                     <img alt='' src={logo} width='30' height='30' className='d-inline-block align-top' />{' '} Zwift-Autofan
                </Navbar.Brand>
                <Navbar.Toggle aria-controls='basic-navbar-nav' />
                <Navbar.Collapse id='basic-navbar-nav'>
                    <Nav className='me-auto'>
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
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
        <Container>
            <Tab.Content>
                <Tab.Pane eventKey='dashboard'>
                    <p>Dashboard</p>
                </Tab.Pane>
                <Tab.Pane eventKey='zwift'>
                    <p>Zwift</p>
                </Tab.Pane>
                <Tab.Pane eventKey='fan'>
                    <p>Fan</p>
                </Tab.Pane>
                <Tab.Pane eventKey='buttons'>
                    <p>Buttons</p>
                </Tab.Pane>
            </Tab.Content>
        </Container>
    </Tab.Container>
}
export default App;
