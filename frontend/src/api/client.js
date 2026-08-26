const API_URL = import.meta.env.VITE_API_URL;


export async function apiRequest(
    endpoint,
    options = {},
) {
    const token = localStorage.getItem(
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

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers,
        },
    );

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
        throw new Error(
            data?.detail ||
            `Request failed with status ${response.status}`,
        );
    }

    return data;
}