import {
    useEffect,
    useState,
} from "react";

import {
    deleteResume,
    downloadResume,
    getResumes,
    uploadResume,
} from "../api/resumes";


export default function Resumes() {
    const [resumes, setResumes] = useState([]);

    const [name, setName] = useState("");

    const [file, setFile] = useState(null);

    const [loading, setLoading] = useState(true);

    const [uploading, setUploading] = useState(false);

    const [downloadingId, setDownloadingId] = useState(null);

    const [error, setError] = useState("");

    const [deleteTarget, setDeleteTarget] = useState(null);


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


    async function handleDownload(
        resume,
    ) {
        setDownloadingId(
            resume.id,
        );

        setError("");

        try {
            await downloadResume(
                resume.id,
                resume.filename,
            );
        } catch (error) {
            setError(
                error.message,
            );
        } finally {
            setDownloadingId(null);
        }
    }


    async function confirmDelete() {
        if (!deleteTarget) {
            return;
        }

        const resumeId =
            deleteTarget.id;

        setDeleteTarget(null);
        setError("");

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
                        Keep track of the exact resume version used for each application.
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
                        onChange={(
                            event,
                        ) =>
                            setName(
                                event
                                    .target
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
                        onChange={(
                            event,
                        ) =>
                            setFile(
                                event
                                    .target
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

                                    <span className="tag">
                                        PDF
                                    </span>
                                </div>

                                <p>
                                    {
                                        resume.filename
                                    }
                                </p>

                                <p className="muted">
                                    {(
                                        resume.size_bytes /
                                        1024
                                    ).toFixed(
                                        1,
                                    )}{" "}
                                    KB
                                </p>

                                <div className="card-actions">
                                    <button
                                        onClick={() =>
                                            handleDownload(
                                                resume,
                                            )
                                        }
                                        disabled={
                                            downloadingId ===
                                            resume.id
                                        }
                                    >
                                        {downloadingId ===
                                            resume.id
                                            ? "Downloading..."
                                            : "Download"}
                                    </button>

                                    <button
                                        className="danger-button"
                                        onClick={() =>
                                            setDeleteTarget(
                                                resume,
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
                        aria-labelledby="delete-resume-title"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <h2 id="delete-resume-title">
                            Delete resume?
                        </h2>

                        <p>
                            Are you sure you want
                            to delete{" "}
                            <strong>
                                {deleteTarget.name}
                            </strong>{" "}
                            (Version{" "}
                            <strong>
                                {deleteTarget.version}
                            </strong>
                            )?
                        </p>

                        <p>
                            This will permanently
                            remove the saved resume
                            file from CareerTrack.
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
                                Delete Resume
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}