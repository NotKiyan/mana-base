import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import Dashboard from './pages/Dashboard.tsx';
import UserProfile from './pages/UserProfile.tsx';
import SearchResults from './pages/SearchResults.tsx';
import AdvancedSearch from './pages/AdvancedSearch.tsx';
import DeckEditor from './pages/DeckEditor.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';

import { ThemeProvider } from './context/ThemeContext';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <UserProfile />
                        </ProtectedRoute>
                    } />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/advanced" element={<AdvancedSearch />} />
                    <Route path="/deck/:id" element={<DeckEditor />} />
                    <Route path="/admin" element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </Router>
        </ThemeProvider>
    )
}

export default App
