import './App.css';
import Header from './core/header/header';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './features/Home/Home';
import License from './features/License/License';
import Wallpapers from './features/Wallpapers/Wallpapers';
import AdminLogin from './features/AdminLogin/AdminLogin';
import AdminLayout from './features/Admin/AdminLayout';
import ManageWallpapers from './features/Admin/ManageWallpapers/ManageWallpapers';
import ManageUsers from './features/Admin/ManageUsers/ManageUsers';
import ManageEmails from './features/Admin/ManageEmails/ManageEmails';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Contact from './features/Contact/Contact';
import Footer from './core/footer/footer';
import Privacy from './features/Privacy/Privacy';
import UserLayout from './features/UserAuth/layout';
import Account from './features/MyAccount/MyAccount';
import Plans from './features/Plans/Plans';
import Success from './features/Plans/Success/Success';
import { PixelsProvider } from './context/pixelsContext';
import ManageAppUsers from "./features/Admin/ManageAppUsers/ManageAppUsers";

function AppLayout() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

    return (
        <PixelsProvider> {/* Wrap the layout with PixelsProvider */}
            {/* Show Header and Footer only for non-admin and non-auth routes */}
            {!isAdminRoute && !isAuthRoute && <Header />}
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/wallpapers" element={<Wallpapers />} />
                <Route path="/license" element={<License />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/upgrade" element={<Plans />} />
                <Route path="/login" element={<UserLayout view="login" />} />
                <Route path="/register" element={<UserLayout view="register" />} />
                <Route path="/success" element={<Success />} />

                {/* Protected route for user account */}
                <Route path="/account" element={
                    <ProtectedRoute>
                        <Account />
                    </ProtectedRoute>
                } />

                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/*" element={
                    <ProtectedRoute roles={['admin', 'editor']}>
                        <AdminLayout />
                    </ProtectedRoute>
                }>
                    {/* Admin sub-routes */}
                    <Route path="wallpapers" element={<ManageWallpapers />} />
                    <Route path="emails" element={
                        <ProtectedRoute roles={['admin']}>
                            <ManageEmails />
                        </ProtectedRoute>
                    } />
                    <Route path="adminUsers" element={
                        <ProtectedRoute roles={['admin']}>
                            <ManageUsers />
                        </ProtectedRoute>
                    } />
                    <Route path="users" element={
                        <ProtectedRoute roles={['admin']}>
                            <ManageAppUsers />
                        </ProtectedRoute>
                    } />
                </Route>
            </Routes>

            {/* Show Footer only for non-admin and non-auth routes */}
            {!isAdminRoute && !isAuthRoute && <Footer />}
        </PixelsProvider>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppLayout />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
