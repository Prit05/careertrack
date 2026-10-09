const API_URL =
    import.meta.env.VITE_API_URL;


export class ApiError extends Error {
    constructor(
        message,
        status,
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}


export async function apiRequest(
    endpoint,
    options = {},
) {
    const token =
        localStorage.getItem(
            "access_token",
        );

    const headers = {
        ...options.headers,
    };

    if (
        token &&
        !options.skipAuth
    ) {
        headers.Authorization =
            `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,
                headers,
            },
        );
    } catch {
        throw new ApiError(
            "Unable to connect to the CareerTrack API.",
            0,
        );
    }

    if (response.status === 204) {
        return null;
    }

    const contentType =
        response.headers.get(
            "content-type",
        );

    const data =
        contentType?.includes(
            "application/json",
        )
            ? await response.json()
            : null;

    if (!response.ok) {
        throw new ApiError(
            data?.detail ||
                "The request failed.",
            response.status,
        );
    }

    return data;
}