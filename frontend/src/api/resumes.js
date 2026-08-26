import { apiRequest } from "./client";


export async function getResumes() {
    return apiRequest("/resumes");
}


export async function uploadResume(
    name,
    file,
) {
    const formData = new FormData();

    formData.append(
        "name",
        name,
    );

    formData.append(
        "file",
        file,
    );

    return apiRequest(
        "/resumes",
        {
            method: "POST",
            body: formData,
        },
    );
}


export async function deleteResume(
    resumeId,
) {
    return apiRequest(
        `/resumes/${resumeId}`,
        {
            method: "DELETE",
        },
    );
}


export function getResumeDownloadUrl(
    resumeId,
) {
    const apiUrl =
        import.meta.env.VITE_API_URL;

    return (
        `${apiUrl}/resumes/` +
        `${resumeId}/download`
    );
}