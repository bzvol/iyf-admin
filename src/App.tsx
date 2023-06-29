import './App.css';
import Sidebar from "./component/Sidebar";

export default function App() {
    return (
        <div className="body">
            <Sidebar/>
            <main className="main">
                <h1>Content</h1>

                <footer className="footer">
                    <TODOs/>
                </footer>
            </main>
        </div>
    );
}

function TODOs() {
    return (<></>) // TODO: implement
}
