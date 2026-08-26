import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


export default function ProtectedRoute({
    children,
}) {
    const {
        user,
        loading,
    } = useAuth();


    if (loading) {
        return <p>Loading...</p>;
    }


    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    return children;
}

// Application starts
//       ↓
// Do we have a token?
//       ↓
//      Yes
//       ↓
// Ask FastAPI /users/me
//       ↓
//     Valid?
//  ┌────┴────┐
// Yes        No
//  ↓         ↓
// allow     logout