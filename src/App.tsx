import './App.css';
import Sidebar from "./component/Sidebar";
import {useAuth} from "./firebase";

export default function App() {
    const {loggedIn, role} = useAuth();

    return (
        <div className="body">
            <Sidebar/>
            <main className="main">
                {(loggedIn && role === "admin") ? <AuthorizedScreen/> : <UnauthorizedScreen/>}
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

function TODOs() {
    return (<></>) // TODO: implement
}
