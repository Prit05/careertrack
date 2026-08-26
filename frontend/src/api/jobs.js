import { apiRequest } from "./client";


export async function getJobs(search = "") {
    const params = new URLSearchParams();

    if (search.trim()) {
        params.set(
            "search",
            search.trim(),
        );
    }

    const query = params.toString();

    return apiRequest(
        `/jobs${query ? `?${query}` : ""}`,
    );
}


export async function createJob(job) {
    return apiRequest(
        "/jobs",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json",
            },
            body: JSON.stringify(job),
        },
    );
}


export async function updateJob(
    jobId,
    job,
) {
    return apiRequest(
        `/jobs/${jobId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type":
                    "application/json",
            },
            body: JSON.stringify(job),
        },
    );
}


export async function deleteJob(jobId) {
    return apiRequest(
        `/jobs/${jobId}`,
        {
            method: "DELETE",
        },
    );
}