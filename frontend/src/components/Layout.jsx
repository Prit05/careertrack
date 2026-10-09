import {
    Link,
    NavLink,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";


export default function Layout({
    children,
}) {
    const { user, logout } = useAuth();


    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="brand">
                    <Link to="/">
                        CareerTrack
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/">
                        Dashboard
                    </NavLink>

                    <NavLink to="/jobs">
                        Jobs
                    </NavLink>

                    <NavLink to="/applications">
                        Applications
                    </NavLink>

                    <NavLink to="/resumes">
                        Resumes
                    </NavLink>

                    <NavLink to="/interviews">
                        Interviews
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <p>
                        {user?.first_name}{" "}
                        {user?.last_name}
                    </p>

                    <button
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}