import React, { useState } from "react";
import { Table, Button, Container, Card, ListGroup, Badge } from 'react-bootstrap';
import { setPath } from './app/navigationSlice';
import { useDispatch, useSelector } from 'react-redux'
import { get } from 'lodash';


const SetPlayerDebugPanel = () => {
    const [players, setPlayers] = useState([]);
    const dispatch = useDispatch()
    const fetchPlayers = async () => {
        setPlayers([]);
        const activePlayersResponse = await fetch('/api/zwift/__dbg_get_cycling_players');
        const activePlayers = await activePlayersResponse.json();
        setPlayers(activePlayers);
    };
    const setPlayer = async playerId => {
        const setPlayerResponse = await fetch(`/api/zwift/__dbg_set_cycling_player/${playerId}`, { method: 'POST' });
        await setPlayerResponse.json();
        dispatch(setPath('dashboard'));
    };
    const resetUserId = async () => {
        setPlayers([]);
        const resetUserIdResponse = await fetch(`/api/zwift/__dbg_reset_user_id`, { method: 'POST' });
        await resetUserIdResponse.json();
        dispatch(setPath('dashboard'));
    };
    return <Card>
        <Card.Header>Set active player</Card.Header>
        <Card.Body>
            <Button onClick={fetchPlayers} className='me-3'>Fetch active players</Button>
            <Button variant='info' onClick={resetUserId} className='me-3'>Reset User ID</Button>
            <Button variant='warning' onClick={() => setPlayers([])} className='me-3'>Clear players table</Button>
            { players.length > 0 &&
                <Table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>FTP</th>
                            <th>Ride duration</th>
                            <th>Total distance</th>
                        </tr>
                    </thead>
                    <tbody>
                    { players.map(p => <tr key={p.playerId}>
                            <td><Button variant="outline-primary" onClick={() => setPlayer(p.playerId)}>{p.playerId}</Button></td>
                            <td>{p.firstName} {p.lastName}</td>
                            <td>{p.ftp}</td>
                            <td>{new Date(p.rideDurationInSeconds * 1000).toISOString().substr(11, 8)}</td>
                            <td>{p.totalDistanceInMeters / 1000} KM</td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            }
        </Card.Body>
    </Card>
};

const LEDsDebugPanel = () => {
    const leds = useSelector((state) => get(state, 'backend.leds', []));
    const LEDsMapping = {
        off: { bg: 'dark', text: 'Off' },
        on:  { bg: 'info', text: 'On'  },
        slow_blink: { bg: 'success', text: 'Slow Blinking' },
        fast_blink: { bg: 'primary', text: 'Fast Blinking' },
    }
    return <Card>
        <Card.Header>LEDs</Card.Header>
        <Card.Body>
          <ListGroup variant="flush">
          { leds.map((led, index) => <ListGroup.Item key={index}>LED {index}, GPIO {led.pin}
            <Badge pill bg={LEDsMapping[led.status].bg} className='ms-5'>{LEDsMapping[led.status].text}</Badge>
          </ListGroup.Item> )}
        </ListGroup>
        </Card.Body>
    </Card>
}

export const DebugPanel = () => {
    return <Container>
        <LEDsDebugPanel />
        <SetPlayerDebugPanel />
    </Container>
}
