import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Calls from './pages/Calls';
import CallDetails from './pages/CallDetails';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
    return (
        <ThemeProvider>
            <ToastProvider>
                <Router>
                    <DashboardLayout>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/calls" element={<Calls />} />
                            <Route path="/calls/:id" element={<CallDetails />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </DashboardLayout>
                </Router>
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;
