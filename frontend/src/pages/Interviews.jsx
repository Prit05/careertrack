import {
    useEffect,
    useState,
} from "react";

import {
    getApplications,
} from "../api/applications";

import {
    createInterview,
    deleteInterview,
    getInterviews,
    updateInterview,
} from "../api/interviews";


const INTERVIEW_TYPES = [
    "oa",
    "technical",
    "behavioral",
    "system_design",
    "final",
    "other",
];


const RESULTS = [
    "pending",
    "passed",
    "failed",
];


export default function Interviews() {
    const [applications, setApplications] =
        useState([]);

    const [interviews, setInterviews] =
        useState([]);

    const [selectedApplicationId, setSelectedApplicationId] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [showForm, setShowForm] =
        useState(false);

    const [deleteTarget, setDeleteTarget] =
        useState(null);

    const [saving, setSaving] =
        useState(false);


    async function loadData() {
        setLoading(true);
        setError("");

        try {
            const data =
                await getApplications({
                    limit: 100,
                });

            setApplications(
                data.items,
            );

            const interviewGroups =
                await Promise.all(
                    data.items.map(
                        async (
                            application,
                        ) => {
                            const items =
                                await getInterviews(
                                    application.id,
                                );

                            return items.map(
                                (
                                    interview,
                                ) => ({
                                    ...interview,
                                    application,
                                }),
                            );
                        },
                    ),
                );

            setInterviews(
                interviewGroups.flat(),
            );
        } catch (error) {
            setError(
                error.message,
            );
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        loadData();
    }, []);


    async function handleCreate(
        event,
    ) {
        event.preventDefault();

        const form =
            event.currentTarget;

        setSaving(true);
        setError("");

        const formData =
            new FormData(form);

        try {
            await createInterview(
                selectedApplicationId,
                {
                    type:
                        formData.get(
                            "type",
                        ),

                    scheduled_at:
                        new Date(
                            formData.get(
                                "scheduled_at",
                            ),
                        ).toISOString(),

                    notes:
                        formData.get(
                            "notes",
                        ) || null,
                },
            );

            form.reset();

            setShowForm(false);
            setSelectedApplicationId("");

            await loadData();
        } catch (error) {
            setError(
                error.message,
            );
        } finally {
            setSaving(false);
        }
    }


    async function handleResultChange(
        interview,
        result,
    ) {
        try {
            await updateInterview(
                interview.id,
                {
                    result,
                },
            );

            await loadData();
        } catch (error) {
            setError(
                error.message,
            );
        }
    }


    async function confirmDelete() {
        if (!deleteTarget) {
            return;
        }

        const interviewId =
            deleteTarget.id;

        setDeleteTarget(null);
        setError("");

        try {
            await deleteInterview(
                interviewId,
            );

            await loadData();
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
                        Interviews
                    </h1>

                    <p>
                        Keep track of
                        upcoming and
                        completed
                        interview rounds.
                    </p>
                </div>

                <button
                    onClick={() => {
                        setShowForm(
                            !showForm,
                        );

                        setSelectedApplicationId(
                            "",
                        );
                    }}
                >
                    {showForm
                        ? "Close"
                        : "Schedule Interview"}
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
                        Schedule Interview
                    </h2>

                    <label>
                        Application

                        <select
                            value={
                                selectedApplicationId
                            }
                            onChange={(
                                event,
                            ) =>
                                setSelectedApplicationId(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            required
                        >
                            <option value="">
                                Select application
                            </option>

                            {applications.map(
                                (
                                    application,
                                ) => (
                                    <option
                                        key={
                                            application.id
                                        }
                                        value={
                                            application.id
                                        }
                                    >
                                        Application{" "}
                                        {
                                            application.id
                                        }
                                    </option>
                                ),
                            )}
                        </select>
                    </label>


                    <label>
                        Interview Type

                        <select
                            name="type"
                            defaultValue="technical"
                        >
                            {INTERVIEW_TYPES.map(
                                (
                                    type,
                                ) => (
                                    <option
                                        key={
                                            type
                                        }
                                        value={
                                            type
                                        }
                                    >
                                        {
                                            type
                                        }
                                    </option>
                                ),
                            )}
                        </select>
                    </label>


                    <label>
                        Date and Time

                        <input
                            name="scheduled_at"
                            type="datetime-local"
                            required
                        />
                    </label>


                    <label>
                        Notes

                        <textarea
                            name="notes"
                            rows="4"
                        />
                    </label>


                    <button
                        type="submit"
                        disabled={
                            saving ||
                            !selectedApplicationId
                        }
                    >
                        {saving
                            ? "Scheduling..."
                            : "Schedule"}
                    </button>
                </form>
            )}


            {error && (
                <p className="error">
                    {error}
                </p>
            )}


            {loading ? (
                <p>
                    Loading interviews...
                </p>
            ) : interviews.length === 0 ? (
                <div className="empty-state">
                    <h2>
                        No interviews
                    </h2>

                    <p>
                        Schedule your first
                        interview round.
                    </p>
                </div>
            ) : (
                <div className="application-list">
                    {interviews.map(
                        (interview) => (
                            <article
                                className="card"
                                key={
                                    interview.id
                                }
                            >
                                <div className="card-header">
                                    <div>
                                        <h2>
                                            {
                                                interview.type
                                            }
                                        </h2>

                                        <p>
                                            Application:{" "}
                                            {
                                                interview
                                                    .application
                                                    .id
                                            }
                                        </p>
                                    </div>

                                    <button
                                        className="danger-button"
                                        onClick={() =>
                                            setDeleteTarget(
                                                interview,
                                            )
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>


                                <p>
                                    {new Date(
                                        interview.scheduled_at,
                                    ).toLocaleString()}
                                </p>


                                <div className="application-meta">
                                    <span>
                                        Result
                                    </span>

                                    <select
                                        value={
                                            interview.result
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            handleResultChange(
                                                interview,
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                    >
                                        {RESULTS.map(
                                            (
                                                result,
                                            ) => (
                                                <option
                                                    key={
                                                        result
                                                    }
                                                    value={
                                                        result
                                                    }
                                                >
                                                    {
                                                        result
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>


                                {interview.notes && (
                                    <p>
                                        {
                                            interview.notes
                                        }
                                    </p>
                                )}
                            </article>
                        ),
                    )}
                </div>
            )}


            {deleteTarget && (
                <div
                    className="modal-backdrop"
                    onClick={() =>
                        setDeleteTarget(
                            null,
                        )
                    }
                >
                    <div
                        className="confirm-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-interview-title"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <h2 id="delete-interview-title">
                            Delete interview?
                        </h2>

                        <p>
                            Are you sure you want
                            to delete this{" "}
                            <strong>
                                {deleteTarget.type}
                            </strong>{" "}
                            interview?
                        </p>

                        <p>
                            This action cannot
                            be undone.
                        </p>

                        <div className="form-actions">
                            <button
                                className="secondary-button"
                                onClick={() =>
                                    setDeleteTarget(
                                        null,
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="danger-button"
                                onClick={
                                    confirmDelete
                                }
                            >
                                Delete Interview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


// This version makes multiple API requests:
// Get applications
//     ↓
// for each application
//     ↓
// Get interviews
// 
// That's perfectly acceptable for our MVP, but it is an example of something we might optimize later.
// You may hear this discussed as an N+1 query/request problem.
// Later, we can build a better endpoint that returns all upcoming interviews in a single request.