import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getCurrentUser,
    loginUser,
    registerUser,
} from "../api/auth";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {
    const [token, setToken] = useState(
        () => localStorage.getItem("access_token"),
    );

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    async function loadCurrentUser(currentToken) {
        try {
            const currentUser = await getCurrentUser(
                currentToken,
            );

            setUser(currentUser);
        } catch {
            localStorage.removeItem(
                "access_token",
            );

            setToken(null);
            setUser(null);
        }
    }


    useEffect(() => {
        async function initializeAuth() {
            if (!token) {
                setLoading(false);
                return;
            }

            await loadCurrentUser(token);
            setLoading(false);
        }

        initializeAuth();
    }, [token]);


    async function login(email, password) {
        const result = await loginUser(
            email,
            password,
        );

        localStorage.setItem(
            "access_token",
            result.access_token,
        );

        setToken(result.access_token);

        await loadCurrentUser(
            result.access_token,
        );
    }


    async function register(userData) {
        return registerUser(userData);
    }


    function logout() {
        localStorage.removeItem(
            "access_token",
        );

        setToken(null);
        setUser(null);
    }


    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                loading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    return useContext(AuthContext);
}