import { apiRequest } from "./client";


export async function getApplications({
    status = "",
    search = "",
    page = 1,
    limit = 10,
} = {}) {
    const params =
        new URLSearchParams();

    if (status) {
        params.set(
            "status",
            status,
        );
    }

    if (search.trim()) {
        params.set(
            "search",
            search.trim(),
        );
    }

    params.set(
        "page",
        page,
    );

    params.set(
        "limit",
        limit,
    );

    return apiRequest(
        `/applications?${params.toString()}`,
    );
}


export async function createApplication(
    application,
) {
    return apiRequest(
        "/applications",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json",
            },
            body: JSON.stringify(
                application,
            ),
        },
    );
}


export async function updateApplication(
    applicationId,
    application,
) {
    return apiRequest(
        `/applications/${applicationId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type":
                    "application/json",
            },
            body: JSON.stringify(
                application,
            ),
        },
    );
}


export async function deleteApplication(
    applicationId,
) {
    return apiRequest(
        `/applications/${applicationId}`,
        {
            method: "DELETE",
        },
    );
}