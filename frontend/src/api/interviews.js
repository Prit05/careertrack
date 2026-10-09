import { apiRequest } from "./client";


export async function getInterviews(
    applicationId,
) {
    return apiRequest(
        `/applications/${applicationId}/interviews`,
    );
}


export async function createInterview(
    applicationId,
    interview,
) {
    return apiRequest(
        `/applications/${applicationId}/interviews`,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json",
            },
            body: JSON.stringify(
                interview,
            ),
        },
    );
}


export async function updateInterview(
    interviewId,
    interview,
) {
    return apiRequest(
        `/interviews/${interviewId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type":
                    "application/json",
            },
            body: JSON.stringify(
                interview,
            ),
        },
    );
}


export async function deleteInterview(
    interviewId,
) {
    return apiRequest(
        `/interviews/${interviewId}`,
        {
            method: "DELETE",
        },
    );
}