import { useEffect, useState } from "react";

import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";


export default function Dashboard() {
    const {
        token,
        user,
        logout,
    } = useAuth();

    const [summary, setSummary] = useState(null);
    const [error, setError] = useState("");


    useEffect(() => {
        async function loadDashboard() {
            try {
                const data = await apiRequest(
                    "/dashboard/summary",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    },
                );

                setSummary(data);
            } catch (error) {
                setError(error.message);
            }
        }

        if (token) {
            loadDashboard();
        }
    }, [token]);


    return (
        <div>
            <header>
                <h1>CareerTrack</h1>

                <p>
                    Welcome,{" "}
                    {user?.first_name}
                </p>

                <button onClick={logout}>
                    Logout
                </button>
            </header>


            {error && (
                <p>{error}</p>
            )}


            {!summary ? (
                <p>
                    Loading dashboard...
                </p>
            ) : (
                <div>
                    <h2>Dashboard</h2>

                    <p>
                        Applications:{" "}
                        {summary.total_applications}
                    </p>

                    <p>
                        Active:{" "}
                        {summary.active_applications}
                    </p>

                    <p>
                        Interviews:{" "}
                        {summary.interviews}
                    </p>

                    <p>
                        Offers:{" "}
                        {summary.offers}
                    </p>

                    <p>
                        Rejected:{" "}
                        {summary.rejected}
                    </p>
                </div>
            )}
        </div>
    );
}