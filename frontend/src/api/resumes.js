import { apiRequest } from "./client";


export async function getResumes() {
    return apiRequest("/resumes");
}


export async function uploadResume(
    name,
    file,
) {
    const formData = new FormData();

    formData.append("name", name);
    formData.append("file", file);

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


export async function downloadResume(
    resumeId,
    filename,
) {
    const apiUrl =
        import.meta.env.VITE_API_URL;

    const token =
        localStorage.getItem(
            "access_token",
        );

    const response = await fetch(
        `${apiUrl}/resumes/${resumeId}/download`,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        },
    );

    if (!response.ok) {
        throw new Error(
            "Unable to download resume.",
        );
    }

    const blob =
        await response.blob();

    const url =
        window.URL.createObjectURL(
            blob,
        );

    const link =
        document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(
        url,
    );
}


// The browser now does:
// React
//   ↓
// fetch()
//   ↓
// Authorization: Bearer JWT
//   ↓
// FastAPI
//   ↓
// verify user
//   ↓
// GridFS
//   ↓
// PDF bytes
//   ↓
// Blob
//   ↓
// browser download