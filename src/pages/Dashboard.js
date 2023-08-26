import React, { Suspense } from "react";
import { getAuth } from "../utils/helper";
import { Await, defer, json, redirect, useAsyncError, useLoaderData, useNavigate } from "react-router-dom";
import UserList from "../components/dashboard/UserList";

const Error = () => {
    const navigate = useNavigate()
    const error = useAsyncError()
    if(error.status === 403) {
        setTimeout(navigate, 0, '/')
    }
    const message = error.message || 'Something wrong.'
    return (
        <div className="container py-32 text-center text-[red]">{message}</div>
    )
}

const Dashboard = () => {
    const loadedData = useLoaderData()
    return (
        <div className="container py-5">
            <Suspense fallback={<div className="container py-32 text-center">Loading</div>}>
                <Await resolve={loadedData.users} errorElement={<Error/>}>
                    {(data) => <UserList data={data} />}
                </Await>
            </Suspense>
        </div>
    );
};

export default Dashboard;

const usersLoader = async () => {
    const status = getAuth().status;
    if(status !== 'admin') {
        throw json({message: 'Unauthorized!'}, {status: 403})
    }
    const response = await fetch(process.env.REACT_APP_API_URL + '/admin/users', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    if(!response.ok) {
        throw response
    }

    const resDada = await response.json()
    return resDada
}

export const loader = () => {
    return defer({
        users: usersLoader()
    })
}