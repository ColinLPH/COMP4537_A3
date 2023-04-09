import React from 'react'
import axios from 'axios'
import { useEffect, useState } from 'react'
import jwt_decode from "jwt-decode";

const APP_SERVER_PORT = 3300
const AUTH_SERVER_PORT = 9000

function Report({ id, accessToken, setAccessToken, refreshToken }) {
    const [reportTable, setReportTable] = useState('');

    const axiosJWT = axios.create()

    axiosJWT.interceptors.request.use(async function (config){
        const decodeToken = jwt_decode(accessToken.accessToken);
        console.log(decodeToken);
        if(decodeToken.exp < Date.now() / 1000)
        {
            console.log("sending post request to /requestNewAccessToken");
            const res = await axios.get(`http://localhost:${AUTH_SERVER_PORT}/requestNewAccessToken`, {
                headers: {
                    'auth-token-refresh': accessToken.refreshToken
                }
            })
            setAccessToken(res.header['auth-token-access']);
            config.headers['auth-token-access'] = accessToken.accessToken;
        }
        return config;
    }, function(error){
        return Promise.reject(error);
    });

    useEffect(() => {
        const getReport = async () => {
            try {
                const res = await axiosJWT.get(`http://localhost:${APP_SERVER_PORT}/report?id=${id}`, {
                    headers: {
                        'auth-token-access': accessToken.accessToken
                    }
                })
                setReportTable(res.data);
            }
            catch (err) {
                console.log(err);
            }
        }
        getReport();

    }, [id])

    return (
        <>
            <div>Report {id && id}</div>
            <div> {reportTable && reportTable}</div>
        </>
    )
}

export default Report