import {
    useEffect,
    useState,
} from "react";

import {
    createApplication,
    deleteApplication,
    getApplications,
    updateApplication,
} from "../api/applications";

import {
    getJobs,
} from "../api/jobs";


const STATUSES = [
    "saved",
    "applied",
    "oa",
    "interview",
    "final",
    "offer",
    "rejected",
    "withdrawn",
];


export default function Applications() {
    const [applications, setApplications] =
        useState([]);

    const [jobs, setJobs] =
        useState([]);

    const [status, setStatus] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [page, setPage] =
        useState(1);

    const [pages, setPages] =
        useState(0);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [showForm, setShowForm] =
        useState(false);


    async function loadData(
        selectedPage = page,
    ) {
        setLoading(true);
        setError("");

        try {
            const [
                applicationData,
                jobsData,
            ] = await Promise.all([
                getApplications({
                    status,
                    search,
                    page: selectedPage,
                    limit: 10,
                }),
                getJobs(),
            ]);

            setApplications(
                applicationData.items,
            );

            setPages(
                applicationData.pages,
            );

            setJobs(jobsData);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        loadData(1);
    }, [status]);


    function getJob(jobId) {
        return jobs.find(
            (job) =>
                job.id === jobId,
        );
    }


    async function handleCreate(
        event,
    ) {
        event.preventDefault();

        const formData =
            new FormData(event.currentTarget);

        const jobId =
            formData.get("job_id");

        const statusValue =
            formData.get("status");

        try {
            await createApplication({
                job_id: jobId,
                status: statusValue,
                date_applied:
                    formData.get(
                        "date_applied",
                    ) || null,
                follow_up_date:
                    formData.get(
                        "follow_up_date",
                    ) || null,
                notes:
                    formData.get(
                        "notes",
                    ) || null,
            });

            event.currentTarget.reset();

            setShowForm(false);

            await loadData(1);
            setPage(1);
        } catch (error) {
            setError(
                error.message,
            );
        }
    }


    async function handleStatusChange(
        application,
        newStatus,
    ) {
        try {
            await updateApplication(
                application.id,
                {
                    status: newStatus,
                },
            );

            await loadData(page);
        } catch (error) {
            setError(
                error.message,
            );
        }
    }


    async function handleDelete(
        applicationId,
    ) {
        const confirmed =
            window.confirm(
                "Delete this application?",
            );

        if (!confirmed) {
            return;
        }

        try {
            await deleteApplication(
                applicationId,
            );

            await loadData(page);
        } catch (error) {
            setError(
                error.message,
            );
        }
    }


    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>
                        Applications
                    </h1>

                    <p>
                        Track every
                        internship
                        application.
                    </p>
                </div>

                <button
                    onClick={() =>
                        setShowForm(
                            !showForm,
                        )
                    }
                >
                    {showForm
                        ? "Close"
                        : "Add Application"}
                </button>
            </div>


            {showForm && (
                <form
                    className="card"
                    onSubmit={
                        handleCreate
                    }
                >
                    <h2>
                        New Application
                    </h2>

                    <label>
                        Job
                        <select
                            name="job_id"
                            required
                        >
                            <option value="">
                                Select a job
                            </option>

                            {jobs.map(
                                (job) => (
                                    <option
                                        key={
                                            job.id
                                        }
                                        value={
                                            job.id
                                        }
                                    >
                                        {job.company}{" "}
                                        —{" "}
                                        {job.title}
                                    </option>
                                ),
                            )}
                        </select>
                    </label>

                    <label>
                        Status
                        <select
                            name="status"
                            defaultValue="applied"
                        >
                            {STATUSES.map(
                                (item) => (
                                    <option
                                        key={
                                            item
                                        }
                                        value={
                                            item
                                        }
                                    >
                                        {item}
                                    </option>
                                ),
                            )}
                        </select>
                    </label>

                    <label>
                        Date Applied
                        <input
                            type="date"
                            name="date_applied"
                        />
                    </label>

                    <label>
                        Follow-up Date
                        <input
                            type="date"
                            name="follow_up_date"
                        />
                    </label>

                    <label>
                        Notes
                        <textarea
                            name="notes"
                            rows="4"
                        />
                    </label>

                    <button type="submit">
                        Save Application
                    </button>
                </form>
            )}


            <div className="toolbar">
                <input
                    placeholder="Search company or position..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value,
                        )
                    }
                />

                <select
                    value={status}
                    onChange={(event) => {
                        setStatus(
                            event.target.value,
                        );
                        setPage(1);
                    }}
                >
                    <option value="">
                        All statuses
                    </option>

                    {STATUSES.map(
                        (item) => (
                            <option
                                key={item}
                                value={item}
                            >
                                {item}
                            </option>
                        ),
                    )}
                </select>

                <button
                    onClick={() =>
                        loadData(1)
                    }
                >
                    Search
                </button>
            </div>


            {loading ? (
                <p>
                    Loading applications...
                </p>
            ) : error ? (
                <p className="error">
                    {error}
                </p>
            ) : applications.length ===
              0 ? (
                <div className="empty-state">
                    <h2>
                        No applications
                    </h2>
                    <p>
                        Start tracking
                        your internship
                        applications.
                    </p>
                </div>
            ) : (
                <>
                    <div className="application-list">
                        {applications.map(
                            (
                                application,
                            ) => {
                                const job =
                                    getJob(
                                        application.job_id,
                                    );

                                return (
                                    <article
                                        key={
                                            application.id
                                        }
                                        className="card"
                                    >
                                        <div className="card-header">
                                            <div>
                                                <h2>
                                                    {
                                                        job?.title
                                                    }
                                                </h2>

                                                <p>
                                                    {
                                                        job?.company
                                                    }
                                                </p>
                                            </div>

                                            <button
                                                className="danger-button"
                                                onClick={() =>
                                                    handleDelete(
                                                        application.id,
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>

                                        <div className="application-meta">
                                            <span>
                                                Status
                                            </span>

                                            <select
                                                value={
                                                    application.status
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    handleStatusChange(
                                                        application,
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                            >
                                                {STATUSES.map(
                                                    (
                                                        item,
                                                    ) => (
                                                        <option
                                                            key={
                                                                item
                                                            }
                                                            value={
                                                                item
                                                            }
                                                        >
                                                            {
                                                                item
                                                            }
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>

                                        {application
                                            .date_applied && (
                                            <p>
                                                Applied:{" "}
                                                {
                                                    application.date_applied
                                                }
                                            </p>
                                        )}

                                        {application
                                            .follow_up_date && (
                                            <p>
                                                Follow-up:{" "}
                                                {
                                                    application.follow_up_date
                                                }
                                            </p>
                                        )}

                                        {application.notes && (
                                            <p>
                                                {
                                                    application.notes
                                                }
                                            </p>
                                        )}
                                    </article>
                                );
                            },
                        )}
                    </div>

                    <div className="pagination">
                        <button
                            disabled={
                                page <= 1
                            }
                            onClick={() => {
                                const nextPage =
                                    page - 1;

                                setPage(
                                    nextPage,
                                );

                                loadData(
                                    nextPage,
                                );
                            }}
                        >
                            Previous
                        </button>

                        <span>
                            Page {page}{" "}
                            of {pages}
                        </span>

                        <button
                            disabled={
                                page >= pages
                            }
                            onClick={() => {
                                const nextPage =
                                    page + 1;

                                setPage(
                                    nextPage,
                                );

                                loadData(
                                    nextPage,
                                );
                            }}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}