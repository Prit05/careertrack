import { useState } from "react";


const initialState = {
    company: "",
    title: "",
    location: "",
    employment_type: "Internship",
    job_url: "",
    description: "",
    required_skills: "",
    preferred_skills: "",
    posted_date: "",
    deadline: "",
};


export default function JobForm({
    initialValues = initialState,
    onSubmit,
    onCancel,
    submitLabel = "Save Job",
}) {
    const [form, setForm] =
        useState({
            ...initialState,
            ...initialValues,
            required_skills:
                Array.isArray(
                    initialValues.required_skills,
                )
                    ? initialValues.required_skills.join(
                          ", ",
                      )
                    : initialValues.required_skills ||
                      "",
            preferred_skills:
                Array.isArray(
                    initialValues.preferred_skills,
                )
                    ? initialValues.preferred_skills.join(
                          ", ",
                      )
                    : initialValues.preferred_skills ||
                      "",
        });

    const [error, setError] =
        useState("");


    function handleChange(event) {
        const {
            name,
            value,
        } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }


    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        try {
            await onSubmit({
                ...form,
                required_skills:
                    form.required_skills
                        .split(",")
                        .map(
                            (skill) =>
                                skill.trim(),
                        )
                        .filter(Boolean),

                preferred_skills:
                    form.preferred_skills
                        .split(",")
                        .map(
                            (skill) =>
                                skill.trim(),
                        )
                        .filter(Boolean),

                location:
                    form.location ||
                    null,

                employment_type:
                    form.employment_type ||
                    null,

                job_url:
                    form.job_url ||
                    null,

                description:
                    form.description ||
                    null,

                posted_date:
                    form.posted_date ||
                    null,

                deadline:
                    form.deadline ||
                    null,
            });
        } catch (submitError) {
            setError(
                submitError.message,
            );
        }
    }


    return (
        <form
            onSubmit={handleSubmit}
            className="card"
        >
            <h2>{submitLabel}</h2>

            <label>
                Company
                <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                Position
                <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                Location
                <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                />
            </label>

            <label>
                Employment Type
                <select
                    name="employment_type"
                    value={
                        form.employment_type
                    }
                    onChange={handleChange}
                >
                    <option>
                        Internship
                    </option>
                    <option>
                        Co-op
                    </option>
                    <option>
                        Part-time
                    </option>
                    <option>
                        Full-time
                    </option>
                </select>
            </label>

            <label>
                Job URL
                <input
                    name="job_url"
                    type="url"
                    value={form.job_url}
                    onChange={handleChange}
                />
            </label>

            <label>
                Description
                <textarea
                    name="description"
                    rows="5"
                    value={form.description}
                    onChange={handleChange}
                />
            </label>

            <label>
                Required Skills
                <input
                    name="required_skills"
                    placeholder="Python, React, SQL"
                    value={
                        form.required_skills
                    }
                    onChange={handleChange}
                />
            </label>

            <label>
                Preferred Skills
                <input
                    name="preferred_skills"
                    placeholder="AWS, Docker"
                    value={
                        form.preferred_skills
                    }
                    onChange={handleChange}
                />
            </label>

            <label>
                Posted Date
                <input
                    name="posted_date"
                    type="date"
                    value={form.posted_date}
                    onChange={handleChange}
                />
            </label>

            <label>
                Deadline
                <input
                    name="deadline"
                    type="date"
                    value={form.deadline}
                    onChange={handleChange}
                />
            </label>

            {error && (
                <p className="error">
                    {error}
                </p>
            )}

            <div className="form-actions">
                <button type="submit">
                    {submitLabel}
                </button>

                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="secondary-button"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}