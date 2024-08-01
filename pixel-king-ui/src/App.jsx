import './App.css';
import Header from './core/header/header';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./features/Home/Home"
import License from "./features/License/License";
import Wallpapers from "./features/Wallpapers/Wallpapers";
import AdminLogin from "./features/AdminLogin/AdminLogin";
import AdminLayout from "./features/Admin/AdminLayout";
import ManageWallpapers from "./features/Admin/ManageWallpapers/ManageWallpapers";
import ManageUsers from "./features/Admin/ManageUsers/ManageUsers";
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Contact from "./features/Contact/Contact";
import Footer from "./core/footer/footer";
import Privacy from "./features/Privacy/Privacy";
import ManageEmails from "./features/Admin/ManageEmails/ManageEmails";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <>
                    {window.location.pathname.indexOf('/admin') === -1 && <Header />}
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/wallpapers" element={<Wallpapers />} />
                        <Route path="/license" element={<License />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path='/privacy' element={<Privacy />} />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/*" element={
                            <ProtectedRoute>
                                <AdminLayout />
                            </ProtectedRoute>
                        }>
                            <Route path="wallpapers" element={<ManageWallpapers />} />
                            <Route path="emails" element={<ManageEmails />}/>
                            <Route path="users" element={<ManageUsers />} />
                        </Route>
                    </Routes>
                    {window.location.pathname.indexOf('/admin') === -1 && <Footer />}
                </>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
