import {
    useEffect,
    useState,
} from "react";

import {
    deleteResume,
    getResumeDownloadUrl,
    getResumes,
    uploadResume,
} from "../api/resumes";


export default function Resumes() {
    const [resumes, setResumes] =
        useState([]);

    const [name, setName] =
        useState("");

    const [file, setFile] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [uploading, setUploading] =
        useState(false);

    const [error, setError] =
        useState("");


    async function loadResumes() {
        setLoading(true);
        setError("");

        try {
            const data =
                await getResumes();

            setResumes(data);
        } catch (error) {
            setError(
                error.message,
            );
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        loadResumes();
    }, []);


    async function handleUpload(
        event,
    ) {
        event.preventDefault();

        if (!file) {
            setError(
                "Please select a PDF file.",
            );
            return;
        }

        setUploading(true);
        setError("");

        try {
            await uploadResume(
                name,
                file,
            );

            setName("");
            setFile(null);

            event.currentTarget.reset();

            await loadResumes();
        } catch (error) {
            setError(
                error.message,
            );
        } finally {
            setUploading(false);
        }
    }


    async function handleDelete(
        resumeId,
    ) {
        const confirmed =
            window.confirm(
                "Delete this resume?",
            );

        if (!confirmed) {
            return;
        }

        try {
            await deleteResume(
                resumeId,
            );

            await loadResumes();
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
                    <h1>Resumes</h1>

                    <p>
                        Manage the resume
                        versions you send
                        with applications.
                    </p>
                </div>
            </div>


            <form
                className="card"
                onSubmit={
                    handleUpload
                }
            >
                <h2>
                    Upload Resume
                </h2>

                <label>
                    Resume Name

                    <input
                        value={name}
                        onChange={(event) =>
                            setName(
                                event.target
                                    .value,
                            )
                        }
                        placeholder="Software Engineer Resume"
                        required
                    />
                </label>

                <label>
                    PDF File

                    <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(event) =>
                            setFile(
                                event.target
                                    .files?.[0] ??
                                    null,
                            )
                        }
                        required
                    />
                </label>

                <button
                    type="submit"
                    disabled={
                        uploading
                    }
                >
                    {uploading
                        ? "Uploading..."
                        : "Upload Resume"}
                </button>
            </form>


            {error && (
                <p className="error">
                    {error}
                </p>
            )}


            {loading ? (
                <p>
                    Loading resumes...
                </p>
            ) : resumes.length === 0 ? (
                <div className="empty-state">
                    <h2>
                        No resumes yet
                    </h2>

                    <p>
                        Upload your first
                        resume version.
                    </p>
                </div>
            ) : (
                <div className="card-grid">
                    {resumes.map(
                        (resume) => (
                            <article
                                key={
                                    resume.id
                                }
                                className="card"
                            >
                                <div className="card-header">
                                    <div>
                                        <h2>
                                            {
                                                resume.name
                                            }
                                        </h2>

                                        <p>
                                            Version{" "}
                                            {
                                                resume.version
                                            }
                                        </p>
                                    </div>
                                </div>

                                <p>
                                    {
                                        resume.filename
                                    }
                                </p>

                                <p>
                                    {(
                                        resume.size_bytes /
                                        1024
                                    ).toFixed(
                                        1,
                                    )}{" "}
                                    KB
                                </p>

                                <div className="card-actions">
                                    <a
                                        href={getResumeDownloadUrl(
                                            resume.id,
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Download
                                    </a>

                                    <button
                                        className="danger-button"
                                        onClick={() =>
                                            handleDelete(
                                                resume.id,
                                            )
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}