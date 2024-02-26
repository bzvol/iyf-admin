import './App.scss';
import Sidebar from "./component/sidebar/Sidebar";
import {useAuth} from "./firebase";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {Home} from "./pages/Home";
import {useMediaQuery} from "@mui/material";

export default function App() {
    const {loggedIn, admin} = useAuth();

    const router = createBrowserRouter([
        {
            path: "/",
            element: <Home/>,
            /*children: [
                {
                    path: "/iam",
                    element: <IAM/>
                },
            ]*/
        }
    ]);

    const isSmallScreen = useMediaQuery("(max-width: 992px)");

    return (
        <div className="body">
            <Sidebar/>
            <div className="main-wrapper">
                {isSmallScreen && <header className="small-screen-header"><h1>IYF Admin</h1></header>}
                <main className="main">
                    {(loggedIn && admin) ? <RouterProvider router={router}/> : <UnauthorizedScreen/>}
                </main>
            </div>
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
