import './App.css';
import Sidebar from "./component/Sidebar";
import {useAuth} from "./firebase";
import {createBrowserRouter, RouterProvider} from "react-router-dom";

export default function App() {
    const {loggedIn, role} = useAuth();

    const router = createBrowserRouter([
        {
            path: "/",
            element: <AuthorizedScreen/>,
            children: [
                {
                    path: "/iam",
                    element: <IAM/>
                },
            ]
        }
    ])

    return (
        <div className="body">
            <Sidebar/>
            <main className="main">
                {(loggedIn && role === "admin") ? <RouterProvider router={router}/> : <UnauthorizedScreen/>}
            </main>
        </div>
    );
}

function UnauthorizedScreen() {
    return (
        <>
            <h1>Unauthorized</h1>
            <p>You are not authorized to view this page.</p>
        </>
    );
}

function AuthorizedScreen() {
    return (
        <>
            <h1>Authorized</h1>
            <p>You are authorized to view this page.</p>

            <TODOs/>
        </>
    );
}

function IAM() {
    return (<></>) // TODO: implement
}

function TODOs() {
    return (<></>) // TODO: implement
}
