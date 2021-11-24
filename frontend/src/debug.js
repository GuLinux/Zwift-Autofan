import React, { useState } from "react";
import { Table, Button, Container } from 'react-bootstrap';
import { setPath } from './app/navigationSlice';
import { useDispatch } from 'react-redux'

export const DebugPanel = () => {
    const [players, setPlayers] = useState([]);
    const dispatch = useDispatch()
    const fetchPlayers = async () => {
        const activePlayersResponse = await fetch('/api/zwift/__dbg_get_cycling_players');
        const activePlayers = await activePlayersResponse.json();
        setPlayers(activePlayers);
    };
    const setPlayer = async playerId => {
        const setPlayerResponse = await fetch(`/api/zwift/__dbg_set_cycling_player/${playerId}`, { method: 'POST' });
        const setPlayerJSON = await setPlayerResponse.json();
        console.log(setPlayerJSON);
        dispatch(setPath('dashboard'));
    };
    return <Container>
        <p>Fetch active players <Button onClick={fetchPlayers}>Fetch</Button></p>
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
    </Container>
};
