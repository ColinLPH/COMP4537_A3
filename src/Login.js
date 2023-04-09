import React from 'react'
import { useState } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';

import Search from './Search';
import Result from './Result';

const AUTH_SERVER_PORT = 9000;

function Login({selectedTypes, setSelectedTypes}) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState('');
    const [refreshToken, setRefreshToken] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.post(`http://localhost:${AUTH_SERVER_PORT}/login`, {
                username: username,
                password: password
            })
            setUser(res.data);
            setAccessToken(res.headers['auth-token-access']);
            setRefreshToken(res.headers['auth-token-refresh']);
        } catch (err) {
            console.log(err);
        }

    }

    return (
        <div>
            {
                (user?.username) &&
                <>
                    <Dashboard
                        accessToken={accessToken}
                        setAccessToken={setAccessToken}
                        refreshToken={refreshToken}
                    />
                </>
            }
            {
                (!user || !user?.username) &&
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder='username'
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder='password'
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Login</button>
                </form>
            }
            {
                (user?.username) &&
                <>
                    <Search
                        selectedTypes={selectedTypes}
                        setSelectedTypes={setSelectedTypes}
                    />

                    <Result
                        selectedTypes={selectedTypes}
                    />
                </>

            }

        </div>
    )
}

export default Login