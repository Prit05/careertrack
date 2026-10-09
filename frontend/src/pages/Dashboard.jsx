import {
    useEffect,
    useState,
} from "react";

import {
    apiRequest,
} from "../api/client";

import {
    getApplications,
} from "../api/applications";

import {
    useAuth,
} from "../context/AuthContext";


function StatCard({
    label,
    value,
}) {
    return (
        <div className="stat-card">
            <p className="stat-label">
                {label}
            </p>

            <h2 className="stat-value">
                {value}
            </h2>
        </div>
    );
}


function StatusBar({
    status,
    count,
    total,
}) {
    const percentage =
        total > 0
            ? (count / total) * 100
            : 0;

    return (
        <div className="status-row">
            <div className="status-row-header">
                <span>
                    {status}
                </span>

                <strong>
                    {count}
                </strong>
            </div>

            <div className="progress-track">
                <div
                    className="progress-bar"
                    style={{
                        width: `${percentage}%`,
                    }}
                />
            </div>
        </div>
    );
}


export default function Dashboard() {
    const {
        user,
    } = useAuth();

    const [summary, setSummary] =
        useState(null);

    const [recentApplications, setRecentApplications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {
        async function loadDashboard() {
            try {
                const [
                    summaryData,
                    applicationData,
                ] = await Promise.all([
                    apiRequest(
                        "/dashboard/summary",
                    ),

                    getApplications({
                        page: 1,
                        limit: 5,
                    }),
                ]);

                setSummary(
                    summaryData,
                );

                setRecentApplications(
                    applicationData.items,
                );
            } catch (error) {
                setError(
                    error.message,
                );
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);


    if (loading) {
        return (
            <div className="dashboard-page">
                <p>
                    Loading dashboard...
                </p>
            </div>
        );
    }


    if (error) {
        return (
            <div className="dashboard-page">
                <p className="error">
                    {error}
                </p>
            </div>
        );
    }


    return (
        <div className="dashboard-page">
            <div className="page-header">
                <div>
                    <h1>
                        Good to see you,{" "}
                        {user?.first_name}
                    </h1>

                    <p>
                        Here's your current
                        internship search
                        overview.
                    </p>
                </div>
            </div>


            <div className="stats-grid">
                <StatCard
                    label="Applications"
                    value={
                        summary.total_applications
                    }
                />

                <StatCard
                    label="Active"
                    value={
                        summary.active_applications
                    }
                />

                <StatCard
                    label="Interviews"
                    value={
                        summary.interviews
                    }
                />

                <StatCard
                    label="Offers"
                    value={
                        summary.offers
                    }
                />

                <StatCard
                    label="Rejected"
                    value={
                        summary.rejected
                    }
                />
            </div>


            <div className="dashboard-grid">
                <section className="card">
                    <div className="section-header">
                        <div>
                            <h2>
                                Application
                                Breakdown
                            </h2>

                            <p className="muted">
                                Where your
                                applications
                                currently stand.
                            </p>
                        </div>
                    </div>

                    {summary.status_breakdown
                        .length === 0 ? (
                        <p className="muted">
                            No application
                            data yet.
                        </p>
                    ) : (
                        <div>
                            {summary.status_breakdown.map(
                                (item) => (
                                    <StatusBar
                                        key={
                                            item.status
                                        }
                                        status={
                                            item.status
                                        }
                                        count={
                                            item.count
                                        }
                                        total={
                                            summary.total_applications
                                        }
                                    />
                                ),
                            )}
                        </div>
                    )}
                </section>


                <section className="card">
                    <div className="section-header">
                        <div>
                            <h2>
                                Upcoming
                                Interviews
                            </h2>

                            <p className="muted">
                                Your next
                                scheduled rounds.
                            </p>
                        </div>
                    </div>

                    {summary.upcoming_interviews
                        .length === 0 ? (
                        <p className="muted">
                            No upcoming
                            interviews.
                        </p>
                    ) : (
                        <div className="upcoming-list">
                            {summary.upcoming_interviews.map(
                                (
                                    interview,
                                ) => (
                                    <div
                                        className="upcoming-item"
                                        key={
                                            interview.id
                                        }
                                    >
                                        <div>
                                            <strong>
                                                {
                                                    interview.type
                                                }
                                            </strong>

                                            <p className="muted">
                                                {new Date(
                                                    interview.scheduled_at,
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    )}
                </section>
            </div>


            <section className="card">
                <div className="section-header">
                    <div>
                        <h2>
                            Recent
                            Applications
                        </h2>

                        <p className="muted">
                            Your most recent
                            application activity.
                        </p>
                    </div>
                </div>

                {recentApplications.length ===
                0 ? (
                    <p className="muted">
                        No applications yet.
                    </p>
                ) : (
                    <div className="recent-list">
                        {recentApplications.map(
                            (
                                application,
                            ) => (
                                <div
                                    className="recent-item"
                                    key={
                                        application.id
                                    }
                                >
                                    <div>
                                        <strong>
                                            Application
                                        </strong>

                                        <p className="muted">
                                            {
                                                application
                                                    .status
                                            }
                                        </p>
                                    </div>

                                    <span className="tag">
                                        {
                                            application.status
                                        }
                                    </span>
                                </div>
                            ),
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}