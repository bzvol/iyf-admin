import './styles/NavMenu.scss';
import {NavLink} from "react-router-dom";

export default function NavMenu() {
    return (
        <nav className="menu__nav">
            <ul>
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/iam">Users / access management</NavLink></li>
                <li>
                    <span className="no-select">IYF <b>&gt;</b></span>
                    <ul>
                        <li><NavLink to="/iyf/posts">Posts</NavLink></li>
                        <li><NavLink to="/iyf/events">Events</NavLink></li>
                        <li><NavLink to="/iyf/regular">Regular events</NavLink></li>
                    </ul>
                </li>
                <li>
                    <span className="no-select">
                        <span style={{color: 'red', textDecoration: 'line-through'}}>JHM <b>&gt;</b></span>
                        <i> not yet available</i>
                    </span>
                </li>
            </ul>
        </nav>
    );
}
