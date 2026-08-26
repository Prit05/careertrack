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


    async function loadJobs() {
        setLoading(true);
        setError("");

        try {
            const data =
                await getJobs(search);

            setJobs(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        loadJobs();
    }, []);


    async function handleCreate(job) {
        await createJob(job);

        setShowForm(false);

        await loadJobs();
    }


    async function handleUpdate(job) {
        await updateJob(
            editingJob.id,
            job,
        );

        setEditingJob(null);

        await loadJobs();
    }


    async function handleDelete(jobId) {
        const confirmed =
            window.confirm(
                "Delete this job?",
            );

        if (!confirmed) {
            return;
        }

        try {
            await deleteJob(jobId);

            await loadJobs();
        } catch (error) {
            setError(error.message);
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


            {loading ? (
                <p>Loading jobs...</p>
            ) : error ? (
                <p className="error">
                    {error}
                </p>
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
                                            handleDelete(
                                                job.id,
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
        </div>
    );
}