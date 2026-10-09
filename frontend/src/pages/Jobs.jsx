import {
    useEffect,
    useState,
} from "react";

import {
    createJob,
    deleteJob,
    getJobs,
    updateJob,
} from "../api/jobs";

import JobForm from "../components/JobForm";


export default function Jobs() {
    const [jobs, setJobs] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [showForm, setShowForm] =
        useState(false);

    const [editingJob, setEditingJob] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [deleteTarget, setDeleteTarget] =
        useState(null);


    async function loadJobs() {
        setLoading(true);
        setError("");

        try {
            const data =
                await getJobs(search);

            setJobs(data);
        } catch (error) {
            setError(
                error.message,
            );
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        loadJobs();
    }, []);


    async function handleCreate(job) {
        try {
            await createJob(job);

            setShowForm(false);

            await loadJobs();
        } catch (error) {
            setError(
                error.message,
            );
        }
    }


    async function handleUpdate(job) {
        try {
            await updateJob(
                editingJob.id,
                job,
            );

            setEditingJob(null);

            await loadJobs();
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

        const jobId =
            deleteTarget.id;

        setDeleteTarget(null);
        setError("");

        try {
            await deleteJob(jobId);

            await loadJobs();
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
                    <h1>Jobs</h1>

                    <p>
                        Save the positions
                        you are interested in.
                    </p>
                </div>

                <button
                    onClick={() => {
                        setEditingJob(null);
                        setShowForm(true);
                    }}
                >
                    Add Job
                </button>
            </div>


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

                <button
                    onClick={loadJobs}
                >
                    Search
                </button>
            </div>


            {showForm && (
                <JobForm
                    onSubmit={handleCreate}
                    onCancel={() =>
                        setShowForm(false)
                    }
                />
            )}


            {editingJob && (
                <JobForm
                    initialValues={
                        editingJob
                    }
                    onSubmit={handleUpdate}
                    onCancel={() =>
                        setEditingJob(null)
                    }
                    submitLabel="Update Job"
                />
            )}


            {error && (
                <p className="error">
                    {error}
                </p>
            )}


            {loading ? (
                <p>Loading jobs...</p>
            ) : jobs.length === 0 ? (
                <div className="empty-state">
                    <h2>
                        No jobs found
                    </h2>

                    <p>
                        Add your first
                        internship position.
                    </p>
                </div>
            ) : (
                <div className="card-grid">
                    {jobs.map((job) => (
                        <article
                            key={job.id}
                            className="card"
                        >
                            <div className="card-header">
                                <div>
                                    <h2>
                                        {job.title}
                                    </h2>

                                    <p>
                                        {job.company}
                                    </p>
                                </div>

                                <div className="card-actions">
                                    <button
                                        onClick={() =>
                                            setEditingJob(
                                                job,
                                            )
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="danger-button"
                                        onClick={() =>
                                            setDeleteTarget(
                                                job,
                                            )
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>


                            {job.location && (
                                <p>
                                    {job.location}
                                </p>
                            )}


                            {job.required_skills
                                ?.length > 0 && (
                                <div className="tags">
                                    {job.required_skills.map(
                                        (skill) => (
                                            <span
                                                key={
                                                    skill
                                                }
                                                className="tag"
                                            >
                                                {skill}
                                            </span>
                                        ),
                                    )}
                                </div>
                            )}
                        </article>
                    ))}
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
                        aria-labelledby="delete-job-title"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <h2 id="delete-job-title">
                            Delete job?
                        </h2>

                        <p>
                            Are you sure you want
                            to delete{" "}
                            <strong>
                                {deleteTarget.title}
                            </strong>{" "}
                            from{" "}
                            <strong>
                                {deleteTarget.company}
                            </strong>
                            ?
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
                                Delete Job
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}