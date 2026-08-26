const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(
    endpoint,
    options = {},
) {
    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers: {
                ...options.headers,
            },
        },
    );

    const contentType = response.headers.get(
        "content-type",
    );

    const data = contentType?.includes("application/json")
        ? await response.json()
        : null;

    if (!response.ok) {
        const message =
            data?.detail ||
            `Request failed with status ${response.status}`;

        throw new Error(message);
    }

    return data;
}