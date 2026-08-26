import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Applications from "./pages/Applications";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Resumes from "./pages/Resumes";

function ProtectedPage({ children }) {
    return (
        <ProtectedRoute>
            <Layout>
                {children}
            </Layout>
        </ProtectedRoute>
    );
}


export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/"
                    element={
                        <ProtectedPage>
                            <Dashboard />
                        </ProtectedPage>
                    }
                />

                <Route
                    path="/jobs"
                    element={
                        <ProtectedPage>
                            <Jobs />
                        </ProtectedPage>
                    }
                />

                <Route
                    path="/applications"
                    element={
                        <ProtectedPage>
                            <Applications />
                        </ProtectedPage>
                    }
                />

                <Route
                    path="/resumes"
                    element={
                        <ProtectedPage>
                            <Resumes />
                        </ProtectedPage>
                    }
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}