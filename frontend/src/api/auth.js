import { apiRequest } from "./client";

export async function registerUser(userData) {
    return apiRequest(
        "/auth/register",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        },
    );
}


export async function loginUser(
    email,
    password,
) {
    const body = new URLSearchParams();

    body.append("username", email);
    body.append("password", password);

    return apiRequest(
        "/auth/login",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded",
            },
            body,
        },
    );
}


export async function getCurrentUser(token) {
    return apiRequest(
        "/users/me",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );
}